package main

import (
	"github.com/grafana/grafana_plugin_model/go/datasource"
	log "github.com/hashicorp/go-hclog"
	plugin "github.com/hashicorp/go-plugin"
)

var logger = log.New(&log.LoggerOptions{
	Name:  "vertica-grafana-plugin",
	Level: log.LevelFromString("DEBUG"),
})

func main() {
	logger.Debug("Starting Vertica datasource plugin")

	ociDatasource, err := newVerticaDatasource(logger)
	if err != nil {
		pluginLogger.Error("Error creating Vertica datasource: " + err.String())
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
