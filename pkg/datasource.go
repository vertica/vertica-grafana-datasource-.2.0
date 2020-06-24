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
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"time"

	_ "github.com/vertica/vertica-sql-go"
)

func newDatasource() datasource.ServeOpts {
	im := datasource.NewInstanceManager(newDataSourceInstance)
	ds := &VerticaDatasource{
		im: im,
	}

	return datasource.ServeOpts{
		QueryDataHandler:   ds,
		CheckHealthHandler: ds,
	}
}

type VerticaDatasource struct {
	im instancemgmt.InstanceManager
}

type instanceSettings struct {
	db *sql.DB
}

type queryModel struct {
	RawSQL string `json:"rawSql"`
}


func buildField(colType *sql.ColumnType) (*data.Field, func(interface{}) interface{}, error) {
	// TODO we could use colType.Nullable() to make more efficient arrays when not nullable
	colName :=  colType.Name()

	//https://github.com/vertica/vertica-sql-go/blob/master/common/types.go
	//https://github.com/vertica/vertica-sql-go/blob/7b6204c5fc4f44d8b1c4ab6a2d4f6a41f092d70a/rows.go#L101-L118
	switch colType.DatabaseTypeName() {
	case "boolean":
		return data.NewField(colName, nil, make([]*bool, 0)), func(raw interface{}) interface{} {
			t := raw.(bool)
			return &t
		}, nil
	case "integer":
		if colName == "time" {
			return data.NewField(colName, nil, make([]*time.Time, 0)), func(raw interface{}) interface{} {
				t := time.Unix(int64(raw.(int))/1000, 0)
				return &t
			}, nil
		}
		return data.NewField(colName, nil, make([]*float64, 0)), func(raw interface{}) interface{} {
			//TODO Grafana does not support BigInt, float64 it for now
			t := float64(raw.(int))
			return &t
		}, nil
	case "float", "numeric":
		return data.NewField(colName, nil, make([]*float64, 0)), func(raw interface{}) interface{} {
			t := raw.(float64)
			return &t
		}, nil
	case "varchar", "long varchar", "char", "uuid", "varbinary", "long varbinary", "binary":
		return data.NewField(colName, nil, make([]*string, 0)), func(raw interface{}) interface{} {
			t := raw.(string)
			return &t
		}, nil
	case "timestamp", "timestamptz":
		return data.NewField(colName, nil, make([]*time.Time, 0)), func(raw interface{}) interface{} {
			t := raw.(time.Time)
			return &t
		}, nil
	default:
		return nil, nil, fmt.Errorf("unknown data type: %s", colType.DatabaseTypeName())
	}
}

func (v *VerticaDatasource) buildTableQueryResult(rows *sql.Rows, rawSql string) (*data.Frame, error) {
	result := data.NewFrame("results")

	colTypes, err := rows.ColumnTypes()
	if err != nil {
		return nil, err
	}

	converters := make([]func(raw interface{})interface{}, len(colTypes))

	for i, colType := range colTypes {
		field, converter, err := buildField(colType)
		if err != nil {
			return nil, err
		}
		result.Fields = append(result.Fields, field)
		converters[i] = converter
	}

	// Build rows
	rowIn := make([]interface{}, len(colTypes))
	for ct := range rowIn {
		var ii interface{}
		rowIn[ct] = &ii
	}

	for rows.Next() {
		if err := rows.Scan(rowIn...); err != nil {
			return nil, err
		}

		for i, v := range rowIn {
			raw := *(v.(*interface{}))
			if raw == nil {
				result.Fields[i].Append(nil)
			} else {
				result.Fields[i].Append(converters[i](raw))
			}
		}
	}

	meta := data.FrameMeta{
		ExecutedQueryString: rawSql,
	}

	result.Meta = &meta

	return result, nil
}

func (v *VerticaDatasource) query(ctx context.Context, req *backend.QueryDataRequest, query backend.DataQuery) (response backend.DataResponse) {
	// Unmarshal the json into our queryModel
	var qm queryModel
	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return
	}

	var settings *instanceSettings
	settings, response.Error = v.getSettings(req.PluginContext)
	if response.Error != nil {
		return
	}

	qm.RawSQL, response.Error = sanitizeAndInterpolateMacros(qm.RawSQL, query)
	if response.Error != nil {
		return
	}

	var db *sql.DB
	db, response.Error = settings.getDB(ctx)
	if response.Error != nil {
		return
	}

	var rows *sql.Rows
	rows, response.Error = db.QueryContext(ctx, qm.RawSQL)
	if response.Error != nil {
		return
	}

	defer func() {
		err := rows.Close()
		if err != nil{
			log.DefaultLogger.Error(err.Error())
		}
	}()

	var frame *data.Frame
	frame, response.Error = v.buildTableQueryResult(rows, qm.RawSQL)
	if response.Error != nil {
		return
	}
	if frame.TimeSeriesSchema().Type == data.TimeSeriesTypeLong {
		fm := data.FillMissing{
			Mode: data.FillModeNull,
		}
		frame, response.Error = data.LongToWide(frame, &fm)
		if response.Error != nil {
			return
		}
	}

	// add the frames to the response
	response.Frames = append(response.Frames, frame)

	return response
}

func (v *VerticaDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	defer func() { if r := recover(); r != nil {
		log.DefaultLogger.Error(fmt.Sprint(r))
	}}()

	response := backend.NewQueryDataResponse()
	for _, q := range req.Queries {
		response.Responses[q.RefID] = v.query(ctx, req, q)
	}

	return response, nil
}

func (v *VerticaDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	settings, err := v.getSettings(req.PluginContext)
	if err != nil {
		return  &backend.CheckHealthResult{
			Status: backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}

	_, err = settings.getDB(ctx)
	if err != nil {
		return  &backend.CheckHealthResult{
			Status: backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Data source is working",
	}, nil
}

func (v *VerticaDatasource) getSettings(pluginContext backend.PluginContext) (*instanceSettings, error) {
	iface, err := v.im.Get(pluginContext)
	if err != nil {
		return nil, err
	}

	return iface.(*instanceSettings), nil
}

func openConnection(settings *backend.DataSourceInstanceSettings) (*sql.DB, error) {
	password :=  settings.DecryptedSecureJSONData["password"]
	connStr := fmt.Sprintf("vertica://%s:%s@%s/%s", settings.User, password, settings.URL, settings.Database)
	return sql.Open("vertica", connStr)
}

func newDataSourceInstance(setting backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	db, err := openConnection(&setting)
	return &instanceSettings{
		db: db,
	}, err
}

func (s *instanceSettings) Dispose() {
	if err := s.db.Close(); err != nil {
		log.DefaultLogger.Error("Error during closing: ", err.Error())
	}
}

func (s *instanceSettings) getDB(ctx context.Context) (*sql.DB, error) {
	if err := s.db.PingContext(ctx); err != nil {
		// First ping can fail due to timeout and return ErrBadConn
		if err == driver.ErrBadConn {
			err = s.db.PingContext(ctx)
		}
		if err != nil {
			return nil, err
		}
	}
	return s.db, nil
}
