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
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"reflect"
	"time"

	"github.com/grafana/grafana_plugin_model/go/datasource"
	hclog "github.com/hashicorp/go-hclog"
	_ "github.com/vertica/vertica-sql-go"
)

const initialResultRowCapacity int32 = 2048
const initialResultTimeSeriesCapacity int32 = 8192
const initialSeriesCapacity int32 = 32

// VerticaDatasource is a wrapper for the data source instance as a whole.
type VerticaDatasource struct {
	logger hclog.Logger
}

func newVerticaDatasource(aLogger hclog.Logger) (*VerticaDatasource, error) {
	return &VerticaDatasource{logger: aLogger}, nil
}

type configArgs struct {
	User             string `json:"user"`
	Database         string `json:"database"`
	TLSMode          string `json:"tlsmode"`
	UsePreparedStmts bool   `json:"usePreparedStatements"`
}

type queryModel struct {
	DataSourceID string `json:"datasourceId"`
	Format       string `json:"format"`
	RawSQL       string `json:"rawSql"`
	RefID        string `json:"refId"`
}

func appendTableRow(slice []*datasource.TableRow, newRow *datasource.TableRow) []*datasource.TableRow {
	n := len(slice)
	total := len(slice) + 1
	if total > cap(slice) {
		newSize := total*3/2 + 1
		newSlice := make([]*datasource.TableRow, total, newSize)
		copy(newSlice, slice)
		slice = newSlice
	}
	slice = slice[:total]
	slice[n] = newRow
	return slice
}

func appendMetricPoint(slice []*datasource.Point, timestamp int64, value float64) []*datasource.Point {
	n := len(slice)
	total := len(slice) + 1
	if total > cap(slice) {
		newSize := total*3/2 + 1
		newSlice := make([]*datasource.Point, total, newSize)
		copy(newSlice, slice)
		slice = newSlice
	}
	slice = slice[:total]
	slice[n] = &datasource.Point{Timestamp: timestamp, Value: value}
	return slice
}

func appendNewSeries(slice []*datasource.TimeSeries, seriesName string) []*datasource.TimeSeries {
	n := len(slice)
	total := len(slice) + 1
	if total > cap(slice) {
		newSize := total*3/2 + 1
		newSlice := make([]*datasource.TimeSeries, total, newSize)
		copy(newSlice, slice)
		slice = newSlice
	}
	slice = slice[:total]
	slice[n] = &datasource.TimeSeries{Name: seriesName, Points: make([]*datasource.Point, 0, initialResultTimeSeriesCapacity)}
	return slice
}

func (v *VerticaDatasource) buildErrorResponse(refID string, err error) *datasource.DatasourceResponse {
	v.logger.Error(err.Error())

	results := make([]*datasource.QueryResult, 1)
	results[0] = &datasource.QueryResult{Error: err.Error(), RefId: refID}

	return &datasource.DatasourceResponse{Results: results}
}

func (v *VerticaDatasource) buildTableQueryResult(result *datasource.QueryResult, rows *sql.Rows, rawSQL string) {
	result.Tables = make([]*datasource.Table, 1)

	columns, _ := rows.Columns()

	result.Tables[0] = &datasource.Table{
		Columns: make([]*datasource.TableColumn, len(columns)),
		Rows:    make([]*datasource.TableRow, 0, initialResultRowCapacity),
	}

	// Build columns
	for ct := range columns {
		result.Tables[0].Columns[ct] = &datasource.TableColumn{Name: columns[ct]}
	}

	// Build rows
	rowIn := make([]interface{}, len(columns))
	for ct := range rowIn {
		var ii interface{}
		rowIn[ct] = &ii
	}

	for rows.Next() {

		// Scan all values into a generic array of interface{}s.
		rows.Scan(rowIn...)

		// Create a place where we can store the translated row.
		rowOut := make([]*datasource.RowValue, len(columns))

		for ct := range columns {
			var rawValue = *(rowIn[ct].(*interface{}))

			switch val := rawValue.(type) {
			case sql.NullString, sql.NullBool, sql.NullFloat64, sql.NullInt64:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_NULL}
			case string:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_STRING, StringValue: val}
			case int:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_INT64, Int64Value: int64(val)}
			case int64:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_INT64, Int64Value: val}
			case bool:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_BOOL, BoolValue: val}
			case float64:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_DOUBLE, DoubleValue: val}
			case time.Time:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_INT64, Int64Value: val.UnixNano() / 1000000}
			default:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_STRING, StringValue: fmt.Sprintf("MISSING TYPE %v!", reflect.TypeOf(rawValue).Name())}
			}
		}

		result.Tables[0].Rows = appendTableRow(result.Tables[0].Rows, &datasource.TableRow{Values: rowOut})
	}

	result.MetaJson = fmt.Sprintf("{\"rowCount\":%d,\"sql\":\"%s\"}", len(result.Tables[0].Rows), jsonEscape(rawSQL))
}

func (v *VerticaDatasource) buildTimeSeriesQueryResult(result *datasource.QueryResult, rows *sql.Rows, rawSQL string) error {

	result.MetaJson = fmt.Sprintf("{\"rowCount\":0,\"sql\":\"%s\"}", jsonEscape(rawSQL))

	columns, _ := rows.Columns()
	numColumns := len(columns)

	timeIndex := containsString("time", columns)
	if timeIndex == -1 {
		return fmt.Errorf("time series must contain a column called 'time' containing the metric's time")
	}

	metricIndex := containsString("metric", columns)
	prefixSeriesName := metricIndex >= 0 && numColumns > 3

	// Create the output series arrays for every columns.
	result.Series = make([]*datasource.TimeSeries, 0, initialSeriesCapacity)

	// Build row holder
	rowIn := make([]interface{}, len(columns))
	for ct := range rowIn {
		var ii interface{}
		rowIn[ct] = &ii
	}

	// Build series map
	seriesIndexMap := make(map[string]int)
	for rows.Next() {

		// Scan all values into a generic array of interface{}s.
		rows.Scan(rowIn...)

		var timestampInt int64
		var valueFloat float64

		// Get the timestamp value.
		switch val := (*(rowIn[timeIndex].(*interface{}))).(type) {
		case time.Time:
			timestampInt = val.UnixNano() / 1000000
		case int:
			timestampInt = int64(val)
		case int64:
			timestampInt = val
		default:
			return fmt.Errorf("timestamp (time) column must be either a timestamp or an integer")
		}

		for ct := 0; ct < numColumns; ct++ {

			// If this is one of the pre-defined columns, skip it.
			if ct == timeIndex || ct == metricIndex {
				continue
			}

			// Get point value
			switch val := (*(rowIn[ct].(*interface{}))).(type) {
			case float64:
				valueFloat = val
			case int64:
				valueFloat = float64(val)
			case int:
				valueFloat = float64(val)
			default:
				return fmt.Errorf("column %d must be either a float or integer: got type: %v, value: %v", ct+1, reflect.TypeOf(val), val)
			}

			// Figure out what the final series name should be.
			var finalLabel string
			var ok bool

			if metricIndex == -1 {
				finalLabel = columns[ct]
			} else {
				finalLabel, ok = (*(rowIn[metricIndex].(*interface{}))).(string)
				if !ok {
					return fmt.Errorf("metric column %d must be of string type", metricIndex+1)
				}

				if prefixSeriesName {
					finalLabel = finalLabel + " " + columns[ct]
				}
			}

			seriesIndex, contained := seriesIndexMap[finalLabel]
			if !contained {
				result.Series = appendNewSeries(result.Series, finalLabel)
				seriesIndex = len(result.Series) - 1
				seriesIndexMap[finalLabel] = seriesIndex
			}

			result.Series[seriesIndex].Points = appendMetricPoint(result.Series[seriesIndex].Points, timestampInt, valueFloat)
		}
	}

	return nil
}

// Query is primary method of handling requests.
func (v *VerticaDatasource) Query(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {

	var cfg configArgs
	json.Unmarshal([]byte(tsdbReq.Datasource.JsonData), &cfg)

	password := tsdbReq.Datasource.DecryptedSecureJsonData["password"]

	response := &datasource.DatasourceResponse{Results: make([]*datasource.QueryResult, len(tsdbReq.Queries))}
	for ct := range response.Results {
		response.Results[ct] = &datasource.QueryResult{}
	}

	connStr := fmt.Sprintf("vertica://%s:%s@%s/%s", cfg.User, password, tsdbReq.Datasource.Url, cfg.Database)

	connDB, err := sql.Open("vertica", connStr)

	if err != nil {
		for _, result := range response.Results {
			result.Error = err.Error()
		}
		return response, nil
	}

	defer connDB.Close()

	if err = connDB.PingContext(context.Background()); err != nil {
		for _, result := range response.Results {
			result.Error = err.Error()
		}
		return response, nil
	}

	for ct, query := range tsdbReq.Queries {
		var queryArgs queryModel
		json.Unmarshal([]byte(query.ModelJson), &queryArgs)

		response.Results[ct].RefId = queryArgs.RefID

		queryArgs.RawSQL, err = sanitizeAndInterpolateMacros(v.logger, queryArgs.RawSQL, tsdbReq)

		if err != nil {
			response.Results[ct].Error = err.Error()
			continue
		}

		if len(queryArgs.RawSQL) > 0 {
			rows, err := connDB.QueryContext(context.Background(), queryArgs.RawSQL)

			if err != nil {
				response.Results[ct].MetaJson = fmt.Sprintf("{\"rowCount\":0,\"sql\":\"%s\"}", jsonEscape(queryArgs.RawSQL))
				response.Results[ct].Error = err.Error()
				continue
			}

			defer rows.Close()

			if queryArgs.Format == "table" {
				v.buildTableQueryResult(response.Results[ct], rows, queryArgs.RawSQL)
			} else {
				if err = v.buildTimeSeriesQueryResult(response.Results[ct], rows, queryArgs.RawSQL); err != nil {
					response.Results[ct].Series = nil
					response.Results[ct].Error = err.Error()
				}
			}
		}
	}

	return response, nil
}
