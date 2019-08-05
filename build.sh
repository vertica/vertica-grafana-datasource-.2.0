#!/bin/bash

#Do grunt work

if [[ ! -d ./node_modules ]]; then
  echo "dependencies not installed try running: npm install"
  exit 1
fi

./node_modules/.bin/grunt

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

if [[ ! -d ./vendor ]]; then
  echo "dependencies not installed try running: dep ensure"
  exit 1
fi

echo "building all go binaries"
cd backend
# GOOS=$GOOS go build -o ../dist/vertica-plugin$POST
# GOOS=linux go build -gcflags=all="-N -l" -o ../dist/vertica-grafana-datasource_linux_amd64
GOOS=linux go build -o ../dist/vertica-grafana-datasource_linux_amd64
# GOOS=darwin go build -o ../dist/vertica-grafana-datasource_darwin_amd64
# GOOS=windows go build -o ../dist/vertica-grafana-datasource_windows_amd64
cd ..
