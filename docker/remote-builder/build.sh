#!/bin/bash
git pull
npm i --unsafe-perm
node node_modules/vscode/bin/install
npm run build
cp -R out/src/* ../app-out
