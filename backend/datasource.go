package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana_plugin_model/go/datasource"
	hclog "github.com/hashicorp/go-hclog"
	_ "github.com/vertica/vertica-sql-go"
)

//how often to refresh our compartmentID cache
// var cacheRefreshTime = time.Minute

const initialResultRowSize int32 = 2048

//OCIDatasource - pulls in data from telemtry/various oci apis
// type OCIDatasource struct {
// 	plugin.NetRPCUnsupportedPlugin
// 	metricsClient    monitoring.MonitoringClient
// 	identityClient   identity.IdentityClient
// 	config           common.ConfigurationProvider
// 	logger           hclog.Logger
// 	nameToOCID       map[string]string
// 	timeCacheUpdated time.Time
// }

type VerticaDatasource struct {
	logger hclog.Logger
}

func newVerticaDatasource(aLogger hclog.Logger) (*VerticaDatasource, error) {
	return &VerticaDatasource{logger: aLogger}, nil
}

// GrafanaOCIRequest - Query Request comning in from the front end
// type GrafanaOCIRequest struct {
// 	GrafanaCommonRequest
// 	Query      string
// 	Resolution string
// 	Namespace  string
// }

//GrafanaSearchRequest incoming request body for search requests
// type GrafanaSearchRequest struct {
// 	GrafanaCommonRequest
// 	Metric    string `json:"metric,omitempty"`
// 	Namespace string
// }

// type GrafanaCompartmentRequest struct {
// 	GrafanaCommonRequest
// }

// GrafanaCommonRequest - captures the common parts of the search and metricsRequests
type GrafanaCommonRequest struct {
	Compartment string
	Environment string
	QueryType   string
	Region      string
	TenancyOCID string `json:"tenancyOCID"`
}

type configArgs struct {
	User             string `json:"user"`
	Database         string `json:"database"`
	TLSMode          string `json:"tlsmode"`
	UsePreparedStmts bool   `json:"usePreparedStatements"`
}

type queryModel struct {
	DataSourceID  string `json:"datasourceId"`
	Format        string `json:"format"`
	RawSQL        string `json:"rawSql"`
	RefID         string `json:"refId"`
	IntervalMS    uint64 `json:"intervalMs"`
	MaxDataPoints uint64 `json:"maxDataPoints"`
}

func appendTableRow(slice []*datasource.TableRow, newRow *datasource.TableRow) []*datasource.TableRow {
	n := len(slice)
	total := len(slice) + 1
	if total > cap(slice) {
		// Reallocate. Grow to 1.5 times the new size, so we can still grow.
		newSize := total*3/2 + 1
		newSlice := make([]*datasource.TableRow, total, newSize)
		copy(newSlice, slice)
		slice = newSlice
	}
	slice = slice[:total]
	slice[n] = newRow
	return slice
}

func buildErrorResponse(queryArgs queryModel, err error) *datasource.DatasourceResponse {
	results := make([]*datasource.QueryResult, 1)
	results[0] = &datasource.QueryResult{Error: err.Error(), RefId: queryArgs.RefID}

	return &datasource.DatasourceResponse{Results: results}
}

func (v *VerticaDatasource) buildSeriesTimeSeriesResult(result *datasource.QueryResult, rows *sql.Rows, rawSQL string) {
	result.Series = make([]*datasource.TimeSeries, 1)

	result.Series[0] = &datasource.TimeSeries{
		Name:   "sample",
		Tags:   make(map[string]string),
		Points: make([]*datasource.Point, 0),
	}

	result.MetaJson = fmt.Sprintf("{\"rowCount\":%d,\"sql\":\"%s\"}", len(result.Series[0].Points), rawSQL)
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
		//v.logger.Debug(fmt.Sprintf("column %d is %s", ct, columns[ct]))
	}

	// Build rows
	rowIn := make([]interface{}, len(columns))
	for ct := range rowIn {
		var ii interface{}
		rowIn[ct] = &ii
	}

	v.logger.Debug(fmt.Sprintf("number of columns: %d", len(columns)))

	for rows.Next() {

		// Scan all values into a generic array of interface{}s.
		rows.Scan(rowIn...)

		v.logger.Debug(fmt.Sprintf("%v", rowIn))

		// Figure out what the types are.
		// colTypes, _ := rows.ColumnTypes()

		// Create a place where we can store the translated row.
		rowOut := make([]*datasource.RowValue, len(columns))

		for ct, _ := range columns {
			var rawValue = *(rowIn[ct].(*interface{}))
			//var rawType = reflect.TypeOf(rawValue)

			//v.logger.Debug(fmt.Sprintf("col %d: %s type: %v", ct, colName, rawType))

			switch val := rawValue.(type) {
			case string:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_STRING, StringValue: val}
			case int64:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_INT64, Int64Value: val}
			case bool:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_BOOL, BoolValue: val}
			case float64:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_DOUBLE, DoubleValue: val}
			default:
				rowOut[ct] = &datasource.RowValue{Kind: datasource.RowValue_TYPE_STRING, StringValue: "MISSING!"}
			}
		}

		result.Tables[0].Rows = appendTableRow(result.Tables[0].Rows, &datasource.TableRow{Values: rowOut})
	}

	result.MetaJson = fmt.Sprintf("{\"rowCount\":%d,\"sql\":\"%s\"}", len(result.Tables[0].Rows), rawSQL)
}

func (v *VerticaDatasource) buildQueryResponse(queryArgs queryModel, rows *sql.Rows) *datasource.DatasourceResponse {
	results := make([]*datasource.QueryResult, 1)
	results[0] = &datasource.QueryResult{RefId: queryArgs.RefID}

	v.logger.Debug("----")
	v.logger.Debug(fmt.Sprintf("%v", queryArgs))

	switch queryArgs.Format {
	case "table":
		v.buildTableQueryResult(results[0], rows, queryArgs.RawSQL)
	case "time_series":
		v.buildSeriesTimeSeriesResult(results[0], rows, queryArgs.RawSQL)
	}

	return &datasource.DatasourceResponse{Results: results}
}

func (v *VerticaDatasource) Query(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
	v.logger.Debug("Query", "datasource", tsdbReq.Datasource.Name, "TimeRange", tsdbReq.TimeRange)
	v.logger.Debug(tsdbReq.String())
	v.logger.Debug(tsdbReq.Queries[0].ModelJson)
	v.logger.Debug(tsdbReq.Datasource.DecryptedSecureJsonData["password"])
	v.logger.Debug(tsdbReq.Datasource.String())

	var queryArgs queryModel
	json.Unmarshal([]byte(tsdbReq.Queries[0].ModelJson), &queryArgs)

	var cfg configArgs
	json.Unmarshal([]byte(tsdbReq.Datasource.JsonData), &cfg)

	// v.logger.Debug(cfg.Database)
	// v.logger.Debug(cfg.User)
	// v.logger.Debug(cfg.TLSMode)

	password := tsdbReq.Datasource.DecryptedSecureJsonData["password"]

	connStr := fmt.Sprintf("vertica://%s:%s@%s/%s", cfg.User, password, tsdbReq.Datasource.Url, cfg.Database)

	v.logger.Debug(connStr)

	connDB, err := sql.Open("vertica", connStr)

	if err != nil {
		return buildErrorResponse(queryArgs, err), nil
	}

	defer connDB.Close()

	rows, err := connDB.QueryContext(context.Background(), queryArgs.RawSQL)

	if err != nil {
		return buildErrorResponse(queryArgs, err), nil
	}

	defer rows.Close()

	return v.buildQueryResponse(queryArgs, rows), nil
}

// Query - Determine what kind of query we're making
// func (v *VerticaDatasource) Query(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
// 	o.logger.Debug("Query", "datasource", tsdbReq.Datasource.Name, "TimeRange", tsdbReq.TimeRange)
// 	var ts GrafanaCommonRequest
// 	json.Unmarshal([]byte(tsdbReq.Queries[0].ModelJson), &ts)

// 	queryType := ts.QueryType
// 	if o.config == nil {
// 		configProvider, err := getConfigProvider(ts.Environment)
// 		if err != nil {
// 			return nil, errors.Wrap(err, "broken environment")
// 		}
// 		metricsClient, err := monitoring.NewMonitoringClientWithConfigurationProvider(configProvider)
// 		if err != nil {
// 			return nil, errors.New(fmt.Sprint("error with client", spew.Sdump(configProvider), err.Error()))
// 		}
// 		identityClient, err := identity.NewIdentityClientWithConfigurationProvider(configProvider)
// 		if err != nil {
// 			log.Printf("error with client")
// 			panic(err)
// 		}
// 		o.identityClient = identityClient
// 		o.metricsClient = metricsClient
// 		o.config = configProvider
// 	}

// 	switch queryType {
// 	case "compartments":
// 		return o.compartmentsResponse(ctx, tsdbReq)
// 	case "dimensions":
// 		return o.dimensionResponse(ctx, tsdbReq)
// 	case "namespaces":
// 		return o.namespaceResponse(ctx, tsdbReq)
// 	case "regions":
// 		return o.regionsResponse(ctx, tsdbReq)
// 	case "search":
// 		return o.searchResponse(ctx, tsdbReq)
// 	case "test":
// 		return o.testResponse(ctx, tsdbReq)
// 	default:
// 		return o.queryResponse(ctx, tsdbReq)
// 	}
// }

// func (o *OCIDatasource) testResponse(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
// 	var ts GrafanaCommonRequest
// 	json.Unmarshal([]byte(tsdbReq.Queries[0].ModelJson), &ts)

// 	listMetrics := monitoring.ListMetricsRequest{
// 		CompartmentId: common.String(ts.TenancyOCID),
// 	}
// 	reg := common.StringToRegion(ts.Region)
// 	o.metricsClient.SetRegion(string(reg))
// 	res, err := o.metricsClient.ListMetrics(ctx, listMetrics)
// 	status := res.RawResponse.StatusCode
// 	if status >= 200 && status < 300 {
// 		return &datasource.DatasourceResponse{}, nil
// 	}
// 	return nil, errors.Wrap(err, fmt.Sprintf("list metrircs failed %s %d", spew.Sdump(res), status))
// }

// func (o *OCIDatasource) dimensionResponse(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
// 	table := datasource.Table{
// 		Columns: []*datasource.TableColumn{
// 			&datasource.TableColumn{Name: "text"},
// 		},
// 		Rows: make([]*datasource.TableRow, 0),
// 	}

// 	for _, query := range tsdbReq.Queries {
// 		var ts GrafanaSearchRequest
// 		json.Unmarshal([]byte(query.ModelJson), &ts)
// 		reqDetails := monitoring.ListMetricsDetails{}
// 		reqDetails.Namespace = common.String(ts.Namespace)
// 		reqDetails.Name = common.String(ts.Metric)
// 		items, err := o.searchHelper(ctx, ts.Region, ts.Compartment, reqDetails)
// 		if err != nil {
// 			return nil, errors.Wrap(err, fmt.Sprint("list metrircs failed", spew.Sdump(reqDetails)))
// 		}
// 		rows := make([]*datasource.TableRow, 0)
// 		for _, item := range items {
// 			for dimension, value := range item.Dimensions {
// 				rows = append(rows, &datasource.TableRow{
// 					Values: []*datasource.RowValue{
// 						&datasource.RowValue{
// 							Kind:        datasource.RowValue_TYPE_STRING,
// 							StringValue: fmt.Sprintf("%s=%s", dimension, value),
// 						},
// 					},
// 				})
// 			}
// 		}
// 		table.Rows = rows
// 	}
// 	return &datasource.DatasourceResponse{
// 		Results: []*datasource.QueryResult{
// 			&datasource.QueryResult{
// 				RefId:  "dimensions",
// 				Tables: []*datasource.Table{&table},
// 			},
// 		},
// 	}, nil
// }

// func (o *OCIDatasource) namespaceResponse(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
// 	table := datasource.Table{
// 		Columns: []*datasource.TableColumn{
// 			&datasource.TableColumn{Name: "text"},
// 		},
// 		Rows: make([]*datasource.TableRow, 0),
// 	}
// 	for _, query := range tsdbReq.Queries {
// 		var ts GrafanaSearchRequest
// 		json.Unmarshal([]byte(query.ModelJson), &ts)

// 		reqDetails := monitoring.ListMetricsDetails{}
// 		reqDetails.GroupBy = []string{"namespace"}
// 		items, err := o.searchHelper(ctx, ts.Region, ts.Compartment, reqDetails)
// 		if err != nil {
// 			return nil, errors.Wrap(err, fmt.Sprint("list metrircs failed", spew.Sdump(reqDetails)))
// 		}

// 		rows := make([]*datasource.TableRow, 0)
// 		for _, item := range items {
// 			rows = append(rows, &datasource.TableRow{
// 				Values: []*datasource.RowValue{
// 					&datasource.RowValue{
// 						Kind:        datasource.RowValue_TYPE_STRING,
// 						StringValue: *(item.Namespace),
// 					},
// 				},
// 			})
// 		}
// 		table.Rows = rows
// 	}
// 	return &datasource.DatasourceResponse{
// 		Results: []*datasource.QueryResult{
// 			&datasource.QueryResult{
// 				RefId:  "namespaces",
// 				Tables: []*datasource.Table{&table},
// 			},
// 		},
// 	}, nil
// }

// func getConfigProvider(environment string) (common.ConfigurationProvider, error) {
// 	switch environment {
// 	case "local":
// 		return common.DefaultConfigProvider(), nil
// 	case "OCI Instance":
// 		return auth.InstancePrincipalConfigurationProvider()
// 	default:
// 		return nil, errors.New("unknown environment type")
// 	}
// }

// func (o *OCIDatasource) searchResponse(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
// 	table := datasource.Table{
// 		Columns: []*datasource.TableColumn{
// 			&datasource.TableColumn{Name: "text"},
// 		},
// 		Rows: make([]*datasource.TableRow, 0),
// 	}

// 	for _, query := range tsdbReq.Queries {
// 		var ts GrafanaSearchRequest
// 		json.Unmarshal([]byte(query.ModelJson), &ts)
// 		reqDetails := monitoring.ListMetricsDetails{
// 			Namespace: common.String(ts.Namespace),
// 		}
// 		items, err := o.searchHelper(ctx, ts.Region, ts.Compartment, reqDetails)
// 		if err != nil {
// 			return nil, errors.Wrap(err, fmt.Sprint("list metrircs failed", spew.Sdump(reqDetails)))
// 		}

// 		rows := make([]*datasource.TableRow, 0)
// 		metricCache := make(map[string]bool)
// 		for _, item := range items {
// 			if _, ok := metricCache[*(item.Name)]; !ok {
// 				rows = append(rows, &datasource.TableRow{
// 					Values: []*datasource.RowValue{
// 						&datasource.RowValue{
// 							Kind:        datasource.RowValue_TYPE_STRING,
// 							StringValue: *(item.Name),
// 						},
// 					},
// 				})
// 				metricCache[*(item.Name)] = true
// 			}
// 		}
// 		table.Rows = rows
// 	}
// 	return &datasource.DatasourceResponse{
// 		Results: []*datasource.QueryResult{
// 			&datasource.QueryResult{
// 				RefId:  "search",
// 				Tables: []*datasource.Table{&table},
// 			},
// 		},
// 	}, nil

// }

// func (o *OCIDatasource) searchHelper(ctx context.Context, region, compartment string, metricDetails monitoring.ListMetricsDetails) ([]monitoring.Metric, error) {
// 	var items []monitoring.Metric
// 	var page *string
// 	for {
// 		reg := common.StringToRegion(region)
// 		o.metricsClient.SetRegion(string(reg))
// 		res, err := o.metricsClient.ListMetrics(ctx, monitoring.ListMetricsRequest{
// 			CompartmentId:      common.String(compartment),
// 			ListMetricsDetails: metricDetails,
// 			Page:               page,
// 		})
// 		if err != nil {
// 			return nil, errors.Wrap(err, "list metrircs failed")
// 		}
// 		items = append(items, res.Items...)
// 		if res.OpcNextPage == nil {
// 			break
// 		}
// 		page = res.OpcNextPage
// 	}
// 	return items, nil
// }

// func (o *OCIDatasource) compartmentsResponse(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
// 	table := datasource.Table{
// 		Columns: []*datasource.TableColumn{
// 			&datasource.TableColumn{Name: "text"},
// 			&datasource.TableColumn{Name: "text"},
// 		},
// 	}
// 	now := time.Now()
// 	var ts GrafanaSearchRequest
// 	json.Unmarshal([]byte(tsdbReq.Queries[0].ModelJson), &ts)
// 	if o.timeCacheUpdated.IsZero() || now.Sub(o.timeCacheUpdated) > cacheRefreshTime {
// 		o.logger.Debug("refreshing cache")
// 		m, err := o.getCompartments(ctx, ts.TenancyOCID)
// 		if err != nil {
// 			o.logger.Error("Unable to refresh cache")
// 			return nil, err
// 		}
// 		o.nameToOCID = m
// 	}

// 	rows := make([]*datasource.TableRow, 0, len(o.nameToOCID))
// 	for name, id := range o.nameToOCID {
// 		val := &datasource.RowValue{
// 			Kind:        datasource.RowValue_TYPE_STRING,
// 			StringValue: name,
// 		}
// 		id := &datasource.RowValue{
// 			Kind:        datasource.RowValue_TYPE_STRING,
// 			StringValue: id,
// 		}

// 		rows = append(rows, &datasource.TableRow{
// 			Values: []*datasource.RowValue{
// 				val,
// 				id,
// 			},
// 		})
// 	}
// 	table.Rows = rows
// 	return &datasource.DatasourceResponse{
// 		Results: []*datasource.QueryResult{
// 			&datasource.QueryResult{
// 				RefId:  "compartment",
// 				Tables: []*datasource.Table{&table},
// 			},
// 		},
// 	}, nil
// }

// func (o *OCIDatasource) getCompartments(ctx context.Context, rootCompartment string) (map[string]string, error) {
// 	m := make(map[string]string)
// 	m["root compartment"] = rootCompartment
// 	var page *string
// 	for {
// 		res, err := o.identityClient.ListCompartments(ctx,
// 			identity.ListCompartmentsRequest{
// 				CompartmentId:          &rootCompartment,
// 				Page:                   page,
// 				AccessLevel:            identity.ListCompartmentsAccessLevelAny,
// 				CompartmentIdInSubtree: common.Bool(true),
// 			})
// 		if err != nil {
// 			return nil, errors.Wrap(err, fmt.Sprintf("this is what we were trying to get %s", rootCompartment))
// 		}
// 		for _, compartment := range res.Items {
// 			if compartment.LifecycleState == identity.CompartmentLifecycleStateActive {
// 				m[*(compartment.Name)] = *(compartment.Id)
// 			}
// 		}
// 		if res.OpcNextPage == nil {
// 			break
// 		}
// 		page = res.OpcNextPage
// 	}
// 	return m, nil
// }

// type responseAndQuery struct {
// 	ociRes monitoring.SummarizeMetricsDataResponse
// 	query  *datasource.Query
// 	err    error
// }

// func (o *OCIDatasource) queryResponse(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
// 	results := make([]responseAndQuery, 0, len(tsdbReq.Queries))
// 	for _, query := range tsdbReq.Queries {
// 		var ts GrafanaOCIRequest
// 		json.Unmarshal([]byte(query.ModelJson), &ts)

// 		start := time.Unix(tsdbReq.TimeRange.FromEpochMs/1000, (tsdbReq.TimeRange.FromEpochMs%1000)*1000000).UTC()
// 		end := time.Unix(tsdbReq.TimeRange.ToEpochMs/1000, (tsdbReq.TimeRange.ToEpochMs%1000)*1000000).UTC()

// 		start = start.Truncate(time.Millisecond)
// 		end = end.Truncate(time.Millisecond)

// 		req := monitoring.SummarizeMetricsDataDetails{
// 			Query:      common.String(ts.Query),
// 			Namespace:  common.String(ts.Namespace),
// 			StartTime:  &common.SDKTime{start},
// 			EndTime:    &common.SDKTime{end},
// 			Resolution: common.String(ts.Resolution),
// 		}
// 		reg := common.StringToRegion(ts.Region)
// 		o.metricsClient.SetRegion(string(reg))

// 		request := monitoring.SummarizeMetricsDataRequest{
// 			CompartmentId:               common.String(ts.Compartment),
// 			SummarizeMetricsDataDetails: req,
// 		}

// 		res, err := o.metricsClient.SummarizeMetricsData(ctx, request)
// 		if err != nil {
// 			return nil, errors.Wrap(err, fmt.Sprint(spew.Sdump(query), spew.Sdump(request), spew.Sdump(res)))
// 		}
// 		results = append(results, responseAndQuery{
// 			res,
// 			query,
// 			err,
// 		})
// 	}
// 	queryRes := make([]*datasource.QueryResult, 0, len(results))
// 	for _, q := range results {
// 		res := &datasource.QueryResult{
// 			RefId: q.query.RefId,
// 		}
// 		if q.err != nil {
// 			res.Error = q.err.Error()
// 			queryRes = append(queryRes, res)
// 			continue
// 		}
// 		//Items -> timeserries
// 		series := make([]*datasource.TimeSeries, 0, len(q.ociRes.Items))
// 		for _, item := range q.ociRes.Items {
// 			t := &datasource.TimeSeries{
// 				Name: *(item.Name),
// 			}
// 			var re = regexp.MustCompile(`(?m)\w+Name`)
// 			for k, v := range item.Dimensions {
// 				o.logger.Debug(k)
// 				if re.MatchString(k) {
// 					t.Name = fmt.Sprintf("%s, {%s}", t.Name, v)
// 				}
// 			}
// 			// if there isn't a human readable name fallback to resourceId
// 			if t.Name == *(item).Name {
// 				resourceID := item.Dimensions["resourceId"]
// 				id := resourceID[strings.LastIndex(resourceID, "."):]
// 				display := resourceID[0:strings.LastIndex(resourceID, ".")] + id[0:4] + "..." + id[len(id)-6:]
// 				t.Name = fmt.Sprintf("%s, {%s}", t.Name, display)
// 			}
// 			// if the namespace is loadbalancer toss on the Ad name to match the console
// 			if *(item.Namespace) == "oci_lbaas" {
// 				availabilityDomain := item.Dimensions["availabilityDomain"]
// 				t.Name = fmt.Sprintf("%s, %s", t.Name, availabilityDomain)
// 			}
// 			p := make([]*datasource.Point, 0, len(item.AggregatedDatapoints))
// 			for _, metric := range item.AggregatedDatapoints {
// 				point := &datasource.Point{
// 					Timestamp: int64(metric.Timestamp.UnixNano() / 1000000),
// 					Value:     *(metric.Value),
// 				}
// 				p = append(p, point)
// 			}
// 			t.Points = p
// 			series = append(series, t)
// 		}
// 		res.Series = series
// 		queryRes = append(queryRes, res)
// 	}

// 	response := &datasource.DatasourceResponse{
// 		Results: queryRes,
// 	}

// 	return response, nil
// }

// func (o *OCIDatasource) regionsResponse(ctx context.Context, tsdbReq *datasource.DatasourceRequest) (*datasource.DatasourceResponse, error) {
// 	table := datasource.Table{
// 		Columns: []*datasource.TableColumn{
// 			&datasource.TableColumn{Name: "text"},
// 		},
// 		Rows: make([]*datasource.TableRow, 0),
// 	}
// 	for _, query := range tsdbReq.Queries {
// 		var ts GrafanaOCIRequest
// 		json.Unmarshal([]byte(query.ModelJson), &ts)
// 		res, err := o.identityClient.ListRegions(ctx)
// 		if err != nil {
// 			return nil, errors.Wrap(err, "error fetching regions")
// 		}
// 		rows := make([]*datasource.TableRow, 0, len(res.Items))
// 		o.logger.Debug("successful req", spew.Sdump(res))
// 		for _, item := range res.Items {
// 			rows = append(rows, &datasource.TableRow{
// 				Values: []*datasource.RowValue{
// 					&datasource.RowValue{
// 						Kind:        datasource.RowValue_TYPE_STRING,
// 						StringValue: *(item.Name),
// 					},
// 				},
// 			})
// 		}
// 		table.Rows = rows
// 	}
// 	return &datasource.DatasourceResponse{
// 		Results: []*datasource.QueryResult{
// 			&datasource.QueryResult{
// 				RefId:  "regions",
// 				Tables: []*datasource.Table{&table},
// 			},
// 		},
// 	}, nil
// }
