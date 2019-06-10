package main

import (
	"github.com/grafana/grafana_plugin_model/go/datasource"
	hclog "github.com/hashicorp/go-hclog"
	plugin "github.com/hashicorp/go-plugin"
)

var logger = hclog.New(&hclog.LoggerOptions{
	Name:  "vertica-grafana-plugin",
	Level: hclog.LevelFromString("DEBUG"),
})

func main() {
	logger.Debug("Starting Vertica datasource plugin")

	ociDatasource, err := newVerticaDatasource(logger)
	if err != nil {
		logger.Error("Error creating Vertica datasource: " + err.Error())
	} else {
		plugin.Serve(&plugin.ServeConfig{

			HandshakeConfig: plugin.HandshakeConfig{
				ProtocolVersion:  1,
				MagicCookieKey:   "grafana_plugin_type",
				MagicCookieValue: "datasource",
			},
			Plugins: map[string]plugin.Plugin{
				"backend-datasource": &datasource.DatasourcePluginImpl{Plugin: ociDatasource},
			},
			GRPCServer: plugin.DefaultGRPCServer,
		})
	}

}
