#! /bin/sh

rm -rf build/*
cp package.json build/
cp yarn.lock build/
cp index.js build/
cp -r lib build/
cd build
yarn install --production
rm package.json
rm yarn.lock
zip -r function.zip .