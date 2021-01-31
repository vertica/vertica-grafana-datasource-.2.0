import { DataFrame } from '@grafana/data';
/**
 * As we need 2 dataframes for the service map, one with nodes and one with edges we have to figure out which is which.
 * Right now we do not have any metadata for it so we just check preferredVisualisationType and then column names.
 * TODO: maybe we could use column labels to have a better way to do this
 */
export declare function useCategorizeFrames(series: DataFrame[]): {
    nodes: DataFrame[];
    edges: DataFrame[];
};
