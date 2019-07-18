package main

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

const initialResultRowSize int32 = 2048
const initialResultTimeSeriesSize int32 = 8192

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
		Rows:    make([]*datasource.TableRow, 0, initialResultRowSize),
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

	columns, _ := rows.Columns()

	if len(columns) < 2 {
		return fmt.Errorf("time series queries must return at least two columns (%d returned)", len(columns))
	}

	result.Series = make([]*datasource.TimeSeries, 1)
	result.Series[0] = &datasource.TimeSeries{
		Name:   columns[1],
		Points: make([]*datasource.Point, 0, initialResultTimeSeriesSize),
	}

	// Build rows
	rowIn := make([]interface{}, len(columns))
	for ct := range rowIn {
		var ii interface{}
		rowIn[ct] = &ii
	}

	// TODO: optimize this
	for rows.Next() {

		// Scan all values into a generic array of interface{}s.
		rows.Scan(rowIn...)

		var timestampInt int64
		var valueFloat float64

		// Get timestamp column
		switch val := (*(rowIn[0].(*interface{}))).(type) {
		case time.Time:
			timestampInt = val.UnixNano() / 1000000
		case int:
			timestampInt = int64(val)
		case int64:
			timestampInt = val
		default:
			return fmt.Errorf("timestamp column must be either a timestamp or an integer")
		}

		// Get metric column
		switch val := (*(rowIn[1].(*interface{}))).(type) {
		case float64:
			valueFloat = val
		case int64:
			valueFloat = float64(val)
		case int:
			valueFloat = float64(val)
		default:
			return fmt.Errorf("second column (metric) must be either a float or integer")
		}

		result.Series[0].Points = appendMetricPoint(result.Series[0].Points, timestampInt, valueFloat)
	}

	//result.MetaJson = fmt.Sprintf("{\"rowCount\":%d,\"sql\":\"%s\"}", len(result.Series[0].Points), jsonEscape(rawSQL))
	result.MetaJson = "{}"

	return nil
}

// Query is primary method of handling requests.
func (v *VerticaDatasource) Query(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
	v.logger.Debug(fmt.Sprintf("*** QUERY(): %v", tsdbReq))

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
				response.Results[ct].Error = err.Error()
				continue
			}

			defer rows.Close()

			if queryArgs.Format == "table" {
				v.buildTableQueryResult(response.Results[ct], rows, queryArgs.RawSQL)
			} else {
				if err = v.buildTimeSeriesQueryResult(response.Results[ct], rows, queryArgs.RawSQL); err != nil {
					response.Results[ct].Error = err.Error()
				}
			}
		} else {
			response.Results[ct].Error = "empty query string"
		}
	}

	return response, nil
}
