#!/bin/bash
curr=$(pwd)
whisper_cpp_git="https://github.com/ggerganov/whisper.cpp"

set -e

# M1 Pro brew
brew install SDL2

# Step 1: 進入 $(pwd)/addons/addon.stream && npm install
cd "${curr}/addons/addon.stream" && npm install

# Step 2: 確認 $(pwd)/whisper.cpp 資料夾存在，不存在的話 git clone <一個網址>
if [ ! -d "${curr}/whisper.cpp" ]; then
    git clone ${whisper_cpp_git} "${curr}/whisper.cpp"
fi

# Step 3: 把 $(pwd)/addons/addon.stream 複製至 $(pwd)/whisper.cpp/examples
cp -r "${curr}/addons/addon.stream" "${curr}/whisper.cpp/examples"

# Step 4: 到 $(pwd)/whisper.cpp 執行 $(pwd)/addons/addon.stream/make.sh 裡面的內容
cd "${curr}/whisper.cpp" && "${curr}/addons/addon.stream/make.sh"
