#include "napi.h"
#include "common.h"

#include "whisper.h"
#include "struct.h"
#include "task.h"
#include "atomic"

class Worker: public Napi::AsyncWorker {
  public:
    Worker(Napi::Function& callback, whisper_params params, Napi::ThreadSafeFunction tsfn, Napi::Env env)
      : Napi::AsyncWorker(callback), should_run(true), params(params), tsfn(tsfn), env(env) {}


    // 規範要在 Background process 中執行什麼
    void Execute() override {
      task(params, result, env, should_run, tsfn);
    }

    // 任務完成之後，會回到 Main process
    void OnOK() override {
      // HandleScope: 因為 Nodejs 的對象送進 C++ 的時候，C++ 可以針對
      // 這個對象的引用來做事情（Nodejs 會開接口給 C++ 讀取）
      // 在做這段事情的時候，必須要鎖定記憶體該位置的對象不要被 Nodejs 給
      // 自動垃圾回收掉，否則 C++ 會很頭大（應該會直接 Segmentation fault.）
      Napi::HandleScope scope(Env());
      Napi::Object res = Napi::Array::New(Env(), result.size());
      for (uint64_t i = 0; i < result.size(); ++i) {
        Napi::Object tmp = Napi::Array::New(Env(), 3);
        for (uint64_t j = 0; j < 3; ++j) {
          tmp[j] = Napi::String::New(Env(), result[i][j]);
        }
        res[i] = tmp;
      }

      // 回傳值回去，HandleScope 在這個時候會發揮護駕的作用。
      // Null() 代表回傳一個 null 回去，因為在 promise 裡面
      // Callback 的第一個代表 err, 第二個代表 res
      // 回傳 null 回去代表運行沒有產生問題。
      Callback().Call({Env().Null(), res});
    }

    void Stop() {
      should_run.store(false);
    }

  private:
    std::atomic<bool> should_run;
    std::string worker_name = "whisper";
    whisper_params params;
    std::vector<std::vector<std::string>> result;
    Napi::ThreadSafeFunction tsfn;
    Napi::Env env;
};

std::vector<Worker*> worker_threads = {};

Napi::Value whisper_stream(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // 應該是自己 customize 的吧... 我要做好 error handling.
  if (info.Length() <= 0 || !info[0].IsObject()) {
    Napi::TypeError::New(env, "object expected").ThrowAsJavaScriptException();
  }
  if (worker_threads.size() >= 1) {
    Napi::Error::New(env, "Worker thread already exists. Maybe you should remove it first.").ThrowAsJavaScriptException();
  }

  whisper_params params;

  Napi::Object whisper_params = info[0].As<Napi::Object>();
  std::string language = whisper_params.Get("language").As<Napi::String>();
  std::string model = whisper_params.Get("model").As<Napi::String>();
  bool use_gpu = whisper_params.Get("use_gpu").As<Napi::Boolean>();
  Napi::Function onProgress = whisper_params.Get("onProgress").As<Napi::Function>();

  params.language = language;
  params.model = model;
  params.use_gpu = use_gpu;

  Napi::ThreadSafeFunction onProgressCb = Napi::ThreadSafeFunction::New(
    env,
    onProgress,
    "onProgressCallback",
    0,
    1
  );

  Napi::Function callback = info[1].As<Napi::Function>();
  Worker* worker = new Worker(callback, params, onProgressCb, env);
  worker->Queue();

  worker_threads.push_back(worker);

  // 希望回傳回去是正常在運行的:) !
  return env.Null();
}

Napi::Value stop_generation(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // 去找到那個 worker，並且跟他說你不用工作啦！
  if(worker_threads.size() == 0) {
    Napi::Error::New(env, "No worker thread is present.").ThrowAsJavaScriptException();
  }
  if(worker_threads.size() > 1) {
    Napi::Error::New(env, "Anomaly: Worker thread size is greater than 1.").ThrowAsJavaScriptException();
  }
  Worker* worker = worker_threads.back();
  worker->Stop();
  // worker->Cancel(); // ** this does not work if worker is already started serving.

  worker_threads.pop_back();

  return env.Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(
    Napi::String::New(env, "start_generation"),
    Napi::Function::New(env, whisper_stream)
  );
  exports.Set(
    Napi::String::New(env, "stop_generation"),
    Napi::Function::New(env, stop_generation)
  );
  return exports;
}

// NODE_API_MODULE 的第一個 module need not to be string!
NODE_API_MODULE(whisper, Init)