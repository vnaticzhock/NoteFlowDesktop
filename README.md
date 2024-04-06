HOW TO RUN ON MAC M1:

```bash
rm -r node_modules ## i changed electron's version
yarn

## build better-sqlite3 module for electron's node.js sandbox
arch -x86_64 /bin/bash
yarn rebuild
exit

## build whisper.cpp
yarn build-whisper

## open testing websocket server for yjs
yarn yjs-ws

## run react & electron in two windows
1. yarn start
2. yarn e-start
```

Resource

1. [Amazing Cursor Follow Animations in Figma! 😲 — Figma + Spline | Design Weekly](https://www.youtube.com/watch?v=lVSUSGq1G4k)

Typing

1. [Support .js extensions.@TypeStrong/ts-node](https://github.com/TypeStrong/ts-node/issues/783)
