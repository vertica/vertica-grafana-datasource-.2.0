package main

import (
	"bufio"
	"io/ioutil"
	"os"
	"strings"

	"github.com/grafana/grafana_plugin_model/go/datasource"
	hclog "github.com/hashicorp/go-hclog"
	plugin "github.com/hashicorp/go-plugin"
)

func initializeLogger() hclog.Logger {
	logOutput := ioutil.Discard

	if filename, set := os.LookupEnv("VERTICA_GRAFANA_LOG_FILE"); set {
		if f, err := os.Create(filename); err == nil {
			logOutput = f
		}
	}

	logLevel := hclog.LevelFromString("INFO")

	if logEnv, set := os.LookupEnv("VERTICA_GRAFANA_LOG_LEVEL"); set {
		if newLevel := hclog.LevelFromString(strings.ToUpper(logEnv)); newLevel != hclog.NoLevel {
			logLevel = newLevel
		}
	}

	return hclog.New(&hclog.LoggerOptions{
		Name:   "vertica-grafana-plugin",
		Level:  logLevel,
		Output: bufio.NewWriter(logOutput),
	})
}

func main() {

	logger := initializeLogger()

	logger.Info("Starting Vertica datasource plugin")

	verticaDatasource, err := newVerticaDatasource(logger)

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
				"backend-datasource": &datasource.DatasourcePluginImpl{Plugin: verticaDatasource},
			},
			GRPCServer: plugin.DefaultGRPCServer,
		})
	}

}
