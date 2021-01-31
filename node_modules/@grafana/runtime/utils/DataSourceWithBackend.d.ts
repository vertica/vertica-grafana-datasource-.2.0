import { DataSourceApi, DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings, DataQuery, DataSourceJsonData, ScopedVars } from '@grafana/data';
import { Observable } from 'rxjs';
/**
 * Describes the current health status of a data source plugin.
 *
 * @public
 */
export declare enum HealthStatus {
    Unknown = "UNKNOWN",
    OK = "OK",
    Error = "ERROR"
}
/**
 * Describes the payload returned when checking the health of a data source
 * plugin.
 *
 * @public
 */
export interface HealthCheckResult {
    status: HealthStatus;
    message: string;
    details?: Record<string, any>;
}
/**
 * Extend this class to implement a data source plugin that is depending on the Grafana
 * backend API.
 *
 * @public
 */
export declare class DataSourceWithBackend<TQuery extends DataQuery = DataQuery, TOptions extends DataSourceJsonData = DataSourceJsonData> extends DataSourceApi<TQuery, TOptions> {
    constructor(instanceSettings: DataSourceInstanceSettings<TOptions>);
    /**
     * Ideally final -- any other implementation may not work as expected
     */
    query(request: DataQueryRequest<TQuery>): Observable<DataQueryResponse>;
    /**
     * Override to skip executing a query
     *
     * @returns false if the query should be skipped
     *
     * @virtual
     */
    filterQuery?(query: TQuery): boolean;
    /**
     * Override to apply template variables.  The result is usually also `TQuery`, but sometimes this can
     * be used to modify the query structure before sending to the backend.
     *
     * NOTE: if you do modify the structure or use template variables, alerting queries may not work
     * as expected
     *
     * @virtual
     */
    applyTemplateVariables(query: TQuery, scopedVars: ScopedVars): Record<string, any>;
    /**
     * Make a GET request to the datasource resource path
     */
    getResource(path: string, params?: any): Promise<any>;
    /**
     * Send a POST request to the datasource resource path
     */
    postResource(path: string, body?: any): Promise<any>;
    /**
     * Run the datasource healthcheck
     */
    callHealthCheck(): Promise<HealthCheckResult>;
    /**
     * Checks the plugin health
     * see public/app/features/datasources/state/actions.ts for what needs to be returned here
     */
    testDatasource(): Promise<any>;
}
