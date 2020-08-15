package main

// Copyright (c) 2019 Micro Focus or one of its affiliates.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
