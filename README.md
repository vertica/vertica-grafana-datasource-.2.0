u
 vertica-grafana-datasource

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

```bash
ln -s (this_dir)/dist (grafana_dir)/data/plugins/vertica-grafana-datasource 
```
Note: If using Grafana 7.0.0, it now requires signed plugins and recommends updating plugins to use the new framework. The Vertica plugin is unsigned and currently doesn't use the new framework, so you will need to add the following configuration parameter to the /etc/grafana/grafana.ini file in the [plugins] section for it to load. Restart the Grafana server after adding this change.
allow_loading_unsigned_plugins = vertica-grafana-datasource

Note: Grafana plans on depricating and eventually removing the ability to run unsigned plugins. Once they remove the ability this configuration parameter and the Vertica grafana datasource plugin will no longer work.

## Logging

You can enable backend logging by setting two variables. On your Grafana server node...
```bash
export VERTICA_GRAFANA_LOG_FILE=(log file name)
export VERTICA_GRAFANA_LOG_LEVEL=[ DEBUG|INFO|ERROR|WARN|FATAL ] (default is INFO)
```
After that, you can simply watch the log file.

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
      GOOS=linux go build -o ../dist/vertica-grafana-datasource_linux_amd64
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
3. Ctrl-C and re-run <i>grafana-server</i>
4. Repeat until tired.
