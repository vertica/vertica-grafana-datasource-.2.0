# vertica-grafana-plugin

## Overview
This is a work-in-progress Grafana plugin to support the Vertica database.

It defines a new datsource that communicates with Vertica using the Vertica golang driver. [http://github.com/vertica/vertica-sql-go]. Due to this, we needed to implement both front and and back end components using the largely-undocumented backend framework.

## Setting Up Your Development Environment

1. Set up a Go development environment with the appropriate GOROOT and GOPATH envrionment variables.
2. Download Grafana itself and build it per their instructions. [http://github.com/grafana/grafana]
3. Install npm [http://nodejs.org]
4. Install dep [https://github.com/golang/dep]
5. Start Grafana once by running the grafana-server binary you built in step 2.
6. Create a symbolic link from the Grafana's plugin directory to this project's 'dist' directory thusly:

```
ln -s (this_dir)/dist (grafana_dir)/data/plugins/vertica-datasource 
```

## Using Grafana Docker Image

It is possible to run the [grafana/grafana](https://hub.docker.com/r/grafana/grafana) Docker image instead of a local grafana-server binary.

1. Build the drivers source
   * `dep ensure`
   * Building on Linux?
      ```
      ./build.sh
      ```
   * Otherwise
      ```
      cd backend
      GOOS=linux go build -o ../dist/vertica-plugin_linux_amd64
      cd ..
      ```
1. Start the grafana Docker image
   * `docker-compose up -d`
1. Confirm that server has started
   * `docker-compose logs`
1. Open web browser to [localhost:30000/](http://localhost:30000/)
1. Cleanup the container, after testing
   * `docker-compose down -v`

## Rapid Development Cycle

1. Make your code changes.
2. Run './build.sh'
3. Ctrl-C and re-run <i>vertica-server</i>
4. Repeat until tired.
