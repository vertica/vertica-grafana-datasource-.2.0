import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface VerticaQuery extends DataQuery {
  rawSql: string;
}

export const defaultQuery: Partial<VerticaQuery> = {
  rawSql:
    'SELECT \n\
$__time(end_time), \n\
average_cpu_usage_percent \n\
FROM \n\
v_monitor.cpu_usage \n\
WHERE \n\
$__timeFilter(end_time)',
};

export interface VerticaDataSourceOptions extends DataSourceJsonData {}
export interface VerticaSecureJsonData {
  password?: string;
}
