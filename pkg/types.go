package main

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
)

type datasourceConfig struct {
	Database                   string `json:"database"`
	Host                       string `json:"host"`
	UseConnectionLoadbalancing bool   `json:"useConnectionLoadbalancing"`
	UsePreparedStatement       bool   `json:"usePreparedStatement"`
	User                       string `json:"user"`
	SSlMode                    string `json:"sslMode,omitempty"`
}

func (config *datasourceConfig) ConnectionURL(password string) string {
	var tlsmode string
	if config.SSlMode == "" {
		tlsmode = "none"
	} else {
		tlsmode = config.SSlMode
	}

	return fmt.Sprintf("vertica://%s:%s@%s/%s?use_prepared_statements=%d&connection_load_balance=%d&tlsmode=%s",
		config.User, password, config.Host, config.Database, boolTouint8(config.UsePreparedStatement), boolTouint8(config.UseConnectionLoadbalancing), tlsmode)
}

func boolTouint8(x bool) int8 {
	var y int8
	if x {
		y = 1
	}
	return y
}

type aTable struct {
	Headers []string
	Rows    [][]interface{}
}

func isSlice(is ...interface{}) []interface{} {
	s := make([]interface{}, len(is))
	copy(s, is)
	return s
}

func generateFrameType(columnTypes []*sql.ColumnType) []data.FieldType {
	colTypes := make([]data.FieldType, 0)
	for _, col := range columnTypes {
		switch col.DatabaseTypeName() {
		case "BOOL":
			colTypes = append(colTypes, data.FieldTypeNullableBool)
			break
		case "INT":
			colTypes = append(colTypes, data.FieldTypeNullableInt64)
			break
		case "FLOAT":
			colTypes = append(colTypes, data.FieldTypeNullableFloat64)
			break
		case "CHAR":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "VARCHAR":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "DATE":
			colTypes = append(colTypes, data.FieldTypeNullableTime)
			break
		case "TIMESTAMP":
			colTypes = append(colTypes, data.FieldTypeNullableTime)
			break
		case "TIMESTAMPTZ":
			colTypes = append(colTypes, data.FieldTypeNullableTime)
			break
		case "INTERVAL DAY":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL DAY TO SECOND":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL HOUR":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL HOUR TO MINUTE":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL HOUR TO SECOND":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL MINUTE":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL MINUTE TO SECOND":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL SECOND":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL DAY TO HOUR":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL DAY TO MINUTE":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL YEAR":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL YEAR TO MONTH":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "INTERVAL MONTH":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "TIME":
			colTypes = append(colTypes, data.FieldTypeNullableTime)
			break
		case "TIMETZ":
			colTypes = append(colTypes, data.FieldTypeNullableTime)
			break
		case "VARBINARY":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "UUID":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "LONG VARCHAR":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "LONG VARBINARY":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "BINARY":
			colTypes = append(colTypes, data.FieldTypeNullableString)
			break
		case "NUMERIC":
			colTypes = append(colTypes, data.FieldTypeNullableFloat64)
			break
		default:
			colTypes = append(colTypes, data.FieldTypeNullableString)
		}
	}
	return colTypes
}

func generateRowIn(columnTypes []*sql.ColumnType) []interface{} {
	rowIn := make([]interface{}, 0)
	for _, colT := range columnTypes {
		switch colT.DatabaseTypeName() {
		case "BOOL":
			var i bool
			rowIn = append(rowIn, &i)
			break
		case "INT":
			var i int64
			rowIn = append(rowIn, &i)
			break
		case "FLOAT":
			var i float64
			rowIn = append(rowIn, &i)
			break
		case "CHAR":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "VARCHAR":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "DATE":
			var i time.Time
			rowIn = append(rowIn, &i)
			break
		case "TIMESTAMP":
			var i time.Time
			rowIn = append(rowIn, &i)
			break
		case "TIMESTAMPTZ":
			var i time.Time
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL DAY":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL DAY TO SECOND":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL HOUR":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL HOUR TO MINUTE":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL HOUR TO SECOND":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL MINUTE":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL MINUTE TO SECOND":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL SECOND":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL DAY TO HOUR":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL DAY TO MINUTE":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL YEAR":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL YEAR TO MONTH":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "INTERVAL MONTH":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "TIME":
			var i time.Time
			rowIn = append(rowIn, &i)
			break
		case "TIMETZ":
			var i time.Time
			rowIn = append(rowIn, &i)
			break
		case "VARBINARY":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "UUID":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "LONG VARCHAR":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "LONG VARBINARY":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "BINARY":
			var i string
			rowIn = append(rowIn, &i)
			break
		case "NUMERIC":
			var i float64
			rowIn = append(rowIn, &i)
			break
		default:
			var i string
			rowIn = append(rowIn, &i)

		}
	}
	return rowIn
}
