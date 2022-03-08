#!/bin/bash

amazon-linux-extras install golang=1.17.8

rm -rf ./bin/gcsim

git clone https://github.com/genshinsim/gcsim

cd ./gcsim/cmd/gcsim

go build

cd ../../../

mkdir bin

cp ./gcsim/cmd/gcsim/gcsim bin/gcsim


rm -rf gcsim

npm run build