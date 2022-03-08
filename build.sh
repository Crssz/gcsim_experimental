#!/bin/bash

amazon-linux-extras install golang1.11

rm -rf ./bin/gcsim

git clone https://github.com/genshinsim/gcsim

cd ./gcsim/cmd/gcsim

go build

cd ../../../

mkdir bin

cp ./gcsim/cmd/gcsim/gcsim bin/gcsim


rm -rf gcsim

npm run build