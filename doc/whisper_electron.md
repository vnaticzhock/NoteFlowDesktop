[Node-API 讀書會](https://nodejs.org/api/n-api.html#node-gyp)

1. 難道只能使用 node-gyp 來進行編譯嗎？我還看到了一個 cmake.js 的工具，可以用 cmake 來進行編譯

[whisper.cpp/examples/addon.node](https://github.com/ggerganov/whisper.cpp/tree/master/examples/addon.node)

```bash
npm install
```

原先使用 node-gyp 的編譯方式長得像這個樣子：
```bash
node-gyp configure --target=11.0.0 --dist-url=https://electronjs.org/headers --arch=x64
node-gyp build
```

現在換成 cmake.js 之後，應該需要這樣替換
```bash
## 原本文檔給的, 
## T: node addon 的名稱
## B: build 裡面的 Release 資料夾，裡面放了 addon.node & dylib
npx cmake-js compile -T whisper-addon -B Release

## 我這樣改：
npx cmake-js compile -T whisper-addon -B Electron \
    --runtime-version 28.2.4 \
    --runtime electron \
    --CD WHISPER_COREML=1

    # --arch arm64
```

Download Core ML Model
```bash
bash ./models/download-coreml-model.sh base.en
```
Or transfer it yourself.
```bash
pip install ane_transformers
pip install openai-whisper
pip install coremltools

./models/generate-coreml-model.sh base.en
```