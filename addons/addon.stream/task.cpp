#include "task.h"
#include "whisper.h"
#include "common.h"
#include "common-sdl.h"
#include "napi.h"

struct whisper_print_user_data {
  const whisper_params * params;
  const std::vector<std::vector<float>> * pcmf32s;
};

int task(whisper_params & params, std::vector<std::vector<std::string>> & result, Napi::Env env, std::atomic<bool>& is_servicing, Napi::ThreadSafeFunction tsfn) {
  /** TODOs:
   * 1. 在 task 裝上第三個參數：Callback，可以回傳回去內容 -> O
   * 2. 設定好 fname_out (vector) & audio output file (搞清楚 wavWriter 是什麼鬼)
   * 3. 在拿到內容的時候呼叫 Callback -> O
   * 4. 注意 nodejs 的 interrupt，而不只有 sdl-polling-event -> O
  */

  auto tsfn_callback = []( Napi::Env env, Napi::Function jsCallback, const char* content) {
    jsCallback.Call( {Napi::String::New(env, content)} );
  };

  params.keep_ms   = std::min(params.keep_ms,   params.step_ms);
  params.length_ms = std::max(params.length_ms, params.step_ms);

  const int n_samples_step = (1e-3*params.step_ms  ) * WHISPER_SAMPLE_RATE;
  const int n_samples_len  = (1e-3*params.length_ms) * WHISPER_SAMPLE_RATE;
  const int n_samples_keep = (1e-3*params.keep_ms  ) * WHISPER_SAMPLE_RATE;
  const int n_samples_30s  = (1e-3*30000.0         ) * WHISPER_SAMPLE_RATE;

  const bool use_vad = n_samples_step <= 0; // sliding window mode uses VAD
  const int n_new_line = !use_vad ? std::max(1, params.length_ms / params.step_ms - 1) : 1; // number of steps to print new line

  params.no_timestamps  = !use_vad;
  params.no_context    |= use_vad;
  params.max_tokens     = 0;

  // init audio

  audio_async audio(params.length_ms);
  if (!audio.init(params.capture_id, WHISPER_SAMPLE_RATE)) {
    fprintf(stderr, "%s: audio.init() failed!\n", __func__);
    return 1;
  }

  audio.resume();

  // ：你輸入了我不認識的語言！
  if (params.language != "auto" && whisper_lang_id(params.language.c_str()) == -1) {
    fprintf(stderr, "error: unknown language '%s'\n", params.language.c_str());
    exit(0);
  }

  struct whisper_context_params cparams = whisper_context_default_params();
  cparams.use_gpu = params.use_gpu;

  struct whisper_context * ctx = whisper_init_from_file_with_params(
    params.model.c_str(), cparams
  );

  if (ctx == nullptr) {
    fprintf(stderr, "error: failed to initialize whisper context\n");
    return 3;
  }

  std::vector<float> pcmf32    (n_samples_30s, 0.0f);
  std::vector<float> pcmf32_old;
  std::vector<float> pcmf32_new(n_samples_30s, 0.0f);

  std::vector<whisper_token> prompt_tokens;

  int n_iter = 0;

  // 把 transcript 寫入到一個檔案裡面
  // TODO: 好像要在這個地方設置一些 callback，讓結果能夠直接寫出去到前端
  std::ofstream fout;
  if (params.fname_out.length() > 0) {
    fout.open(params.fname_out);
    if (!fout.is_open()) {
      fprintf(stderr, "%s: failed to open output file '%s'!\n", __func__, params.fname_out.c_str());
      return 1;
    }
  }

  // 把錄音結果寫入一個 wav 檔裡面
  wav_writer wavWriter;
  // save wav file
  if (params.save_audio) {
    // Get current date/time for filename
    time_t now = time(0);
    char buffer[80];
    strftime(buffer, sizeof(buffer), "%Y%m%d%H%M%S", localtime(&now));
    std::string filename = std::string(buffer) + ".wav";

    wavWriter.open(filename, WHISPER_SAMPLE_RATE, 16, 1);
  }
  printf("[Start speaking]\n");
  fflush(stdout);
  
  auto t_last  = std::chrono::high_resolution_clock::now();
  const auto t_start = t_last;

  while(is_servicing) {
    // printf("Listening...\n");
    if (params.save_audio) {
      wavWriter.write(pcmf32_new.data(), pcmf32_new.size());
    }

    if (!is_servicing) {
      break;
    }

    if (!use_vad) {
      while(true) {
        audio.get(params.step_ms, pcmf32_new);

        // 累積太多了，實在處理不完。
        if ((int) pcmf32_new.size() > 2*n_samples_step) {
          fprintf(stderr, "\n\n%s: WARNING: cannot process audio fast enough, dropping audio ...\n\n", __func__);
          audio.clear();
          continue;
        }

        if ((int) pcmf32_new.size() >= n_samples_step) {
          audio.clear();
          break;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(1));
      }

      const int n_samples_new = pcmf32_new.size();

      // take up to params.length_ms audio from previous iteration
      const int n_samples_take = std::min((int) pcmf32_old.size(), std::max(0, n_samples_keep + n_samples_len - n_samples_new));

      //printf("processing: take = %d, new = %d, old = %d\n", n_samples_take, n_samples_new, (int) pcmf32_old.size());

      pcmf32.resize(n_samples_new + n_samples_take);

      for (int i = 0; i < n_samples_take; i++) {
          pcmf32[i] = pcmf32_old[pcmf32_old.size() - n_samples_take + i];
      }

      memcpy(pcmf32.data() + n_samples_take, pcmf32_new.data(), n_samples_new*sizeof(float));

      pcmf32_old = pcmf32;
    } else {
      const auto t_now  = std::chrono::high_resolution_clock::now();
      const auto t_diff = std::chrono::duration_cast<std::chrono::milliseconds>(t_now - t_last).count();

      if (t_diff < 2000) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        continue;
      }

      audio.get(2000, pcmf32_new);

      if (::vad_simple(pcmf32_new, WHISPER_SAMPLE_RATE, 1000, params.vad_thold, params.freq_thold, false)) {
        audio.get(params.length_ms, pcmf32);
      } else {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        continue;
      }

      t_last = t_now;
    }
  
  
    // 準備好這兩個數據之後，其實就可以直接開始 inference
    {
      whisper_full_params wparams = whisper_full_default_params(WHISPER_SAMPLING_GREEDY);
      wparams.print_progress   = false;
      wparams.print_special    = params.print_special;
      wparams.print_realtime   = false;
      wparams.print_timestamps = !params.no_timestamps;
      wparams.translate        = params.translate;
      wparams.single_segment   = !use_vad;
      wparams.max_tokens       = params.max_tokens;
      wparams.language         = params.language.c_str();
      wparams.n_threads        = params.n_threads;

      wparams.audio_ctx        = params.audio_ctx;
      wparams.speed_up         = params.speed_up;

      wparams.tdrz_enable      = params.tinydiarize; // [TDRZ]

      // disable temperature fallback
      //wparams.temperature_inc  = -1.0f;
      wparams.temperature_inc  = params.no_fallback ? 0.0f : wparams.temperature_inc;

      wparams.prompt_tokens    = params.no_context ? nullptr : prompt_tokens.data();
      wparams.prompt_n_tokens  = params.no_context ? 0       : prompt_tokens.size();

      if (whisper_full(ctx, wparams, pcmf32.data(), pcmf32.size()) != 0) {
        fprintf(stderr, "failed to process audio\n");
        return 6;
      }

      {
        if (!use_vad) {
          printf("\33[2K\r");
          // print long empty line to clear the previous line
          printf("%s", std::string(100, ' ').c_str());

          printf("\33[2K\r");
        } else {
          const int64_t t1 = (t_last - t_start).count()/1000000;
          const int64_t t0 = std::max(0.0, t1 - pcmf32.size()*1000.0/WHISPER_SAMPLE_RATE);

          printf("\n");
          printf("### Transcription %d START | t0 = %d ms | t1 = %d ms\n", n_iter, (int) t0, (int) t1);
          printf("\n");
        }

        const int n_segments = whisper_full_n_segments(ctx);
        for (int i = 0; i < n_segments; ++i) {
          const char * text = whisper_full_get_segment_text(ctx, i);
          if (params.no_timestamps) {
            printf("%s", text);
            fflush(stdout);

            if (params.fname_out.length() > 0) {
              fout << text;
            }
            
          } else {
            const int64_t t0 = whisper_full_get_segment_t0(ctx, i);
            const int64_t t1 = whisper_full_get_segment_t1(ctx, i);

            std::string output = "[" + to_timestamp(t0, false) + " --> " + to_timestamp(t1, false) + "]  " + text;

            if (whisper_full_get_segment_speaker_turn_next(ctx, i)) {
                output += " [SPEAKER_TURN]";
            }

            output += "\n";

            printf("%s", output.c_str());
            fflush(stdout);

            if (params.fname_out.length() > 0) {
                fout << output;
            }
          }

          napi_status status = tsfn.NonBlockingCall(text, tsfn_callback);
          if (status != napi_ok) {
            printf("Error on thread safe function call...\n");
          }
        }

        // for 迴圈結束
        if (params.fname_out.length() > 0) {
          fout << std::endl;
        }

        if (use_vad) {
          printf("\n");
          printf("### Transcription %d END\n", n_iter);
        }
      }

      ++n_iter;

      if (!use_vad && (n_iter % n_new_line) == 0) {
        printf("\n");
        napi_status status = tsfn.NonBlockingCall("[NEW LINE]", tsfn_callback);
          if (status != napi_ok) {
            printf("Error on thread safe function call...\n");
          }

        // keep part of the audio for next iteration to try to mitigate word boundary issues
        pcmf32_old = std::vector<float>(pcmf32.end() - n_samples_keep, pcmf32.end());

        // Add tokens of the last full length segment as the prompt
        if (!params.no_context) {
          prompt_tokens.clear();

          const int n_segments = whisper_full_n_segments(ctx);
          for (int i = 0; i < n_segments; ++i) {
            const int token_count = whisper_full_n_tokens(ctx, i);
            for (int j = 0; j < token_count; ++j) {
              prompt_tokens.push_back(whisper_full_get_token_id(ctx, i, j));
            }
          }
        }
      }
      fflush(stdout);
    }
  }

  printf("Shutting down...\n");

  audio.pause();

  whisper_print_timings(ctx);
  whisper_free(ctx);

  tsfn.Release();

  return 0;
}