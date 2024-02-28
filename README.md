HOW TO RUN ON MAC M1:
```bash
rm -r node_modules ## i changed electron's version
yarn

## build better-sqlite3 module for electron's node.js sandbox
arch -x86_64 /bin/bash
yarn rebuild
exit

## run react & electron in two windows
1. yarn start
2. yarn e-start
```
