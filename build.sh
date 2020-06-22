#!/bin/bash

#Do grunt work

if [[ ! -d ./node_modules ]]; then
  echo "dependencies not installed try running: npm install"
  exit 1
fi

yarn build

# build go

POST=''
GOOS=''

OS="`uname`"
case $OS in
  'Linux')
      POST='_linux_amd64'
      GOOS="linux"
    ;;
  'Darwin')
      POST='_darwin_amd64'
      GOOS="darwin"
    ;;
  'AIX') ;;
  *) ;;
esac

echo "building all go binaries"
cd pkg
GOOS=linux go build -o ../dist/vertica-grafana-datasource_linux_amd64
GOOS=darwin go build -o ../dist/vertica-grafana-datasource_darwin_amd64
GOOS=windows go build -o ../dist/vertica-grafana-datasource_windows_amd64.exe
cd ..

go mod tidy
