## Quick setup

Use ggerganov/whisper.cpp for inferencing
```bash
## Clone the repository
git clone https://github.com/ggerganov/whisper.cpp.git

## download models (in GGML Format)
bash ./models/download-ggml-model.sh base.en

# build the main example
make

# transcribe an audio file
./main -f samples/jfk.wav
```

* 輸入的檔案必須要是 .wav 檔結尾，所以如果是 mp3 extension 的話，需要先進行轉檔，如下：
```bash
ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
```
1. mp3 是有損音質的壓縮格式，而 wav 是無損壓縮格式。

* 有 GGML 的格式，也有 CoreML 的格式，他們之間差在哪裡呢？
1. Core ML 是 Apple 提出的機器學習框架，會 Leverage CPU, GPU 以及 Neural Engine，協助用戶快速進行推論。
2. MacOS 如果不使用這個，將只會使用 CPU 進行推論；若使用，能夠提供三倍以上的加速推論。
3. 建議 Sonoma (Version 14) 以上的作業系統，因為越舊的 OS，推論的能力好像會有差，轉譯的結果會帶來一些幻覺。
* 也有 OpenVino 的格式，他是 Intel 的推論工具包。

## emcmake

Emcmake 是一個 Emcscripten 工具鏈的其中一個工具，他可以幫你將 C 或 C++ 的 Code 編譯成 Wasm

假設我們這麼做：
```bash
# build using Emscripten
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
mkdir build-em && cd build-em
emcmake cmake ..
make -j

# copy the produced page to your HTTP path
cp bin/whisper.wasm/*    /path/to/html/
cp bin/libmain.worker.js /path/to/html/
```

emcmake 會將 cmake 使用的編譯器換成適合 WebAssembly 的編譯器及相關配置，這個工具可以幫助我們在前端直接使用 Whisper，但可能會比較慢？

相關資訊和可能的限制都在這個地方找得到！ [Whisper.wasm/README.md](https://github.com/ggerganov/whisper.cpp/blob/master/examples/whisper.wasm/README.md)


## Node-gyp

這個工具可以將 C/C++ Code 編譯成 Node.js 的原生模組，我認為應該可以突破 Wasm 對於效能上的限制。然而，Node-gyp 希望可以讓模組可以符合相關的 V8 API & Node.js API，如果直接把 make 放進 Node-gyp 裡面跑，可以說是相當缺乏考量。

[nodejs/node-gyp@github](https://github.com/nodejs/node-gyp)