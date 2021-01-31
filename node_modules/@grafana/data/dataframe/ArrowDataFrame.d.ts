import { DataFrame } from '../types';
import { Table } from 'apache-arrow';
export interface ArrowDataFrame extends DataFrame {
    table: Table;
}
export declare function base64StringToArrowTable(text: string): Table;
export declare function arrowTableToDataFrame(table: Table): ArrowDataFrame;
/**
 * @param keepOriginalNames by default, the exported Table will get names that match the
 * display within grafana.  This typically includes any labels defined in the metadata.
 *
 * When using this function to round-trip data, be sure to set `keepOriginalNames=true`
 */
export declare function grafanaDataFrameToArrowTable(data: DataFrame, keepOriginalNames?: boolean): Table;
