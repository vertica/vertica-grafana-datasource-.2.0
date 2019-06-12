package main

import "github.com/grafana/grafana_plugin_model/go/datasource"

func interpolateMacros(rawSQL string, tsdbReq *datasource.DatasourceRequest) string {

	tsdbReq.GetTimeRange()

}
