import { DataFrame, Field, MutableDataFrame } from '@grafana/data';
import { EdgeDatum, NodeDatum } from './types';
declare type Line = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
/**
 * Makes line shorter while keeping the middle in he same place.
 */
export declare function shortenLine(line: Line, length: number): Line;
export declare function getNodeFields(nodes: DataFrame): {
    id: import("@grafana/data").FieldWithIndex | undefined;
    title: import("@grafana/data").FieldWithIndex | undefined;
    subTitle: import("@grafana/data").FieldWithIndex | undefined;
    mainStat: import("@grafana/data").FieldWithIndex | undefined;
    secondaryStat: import("@grafana/data").FieldWithIndex | undefined;
    arc: Field<any, import("@grafana/data").Vector<any>>[];
    details: Field<any, import("@grafana/data").Vector<any>>[];
};
export declare function getEdgeFields(edges: DataFrame): {
    id: import("@grafana/data").FieldWithIndex | undefined;
    source: import("@grafana/data").FieldWithIndex | undefined;
    target: import("@grafana/data").FieldWithIndex | undefined;
    mainStat: import("@grafana/data").FieldWithIndex | undefined;
    secondaryStat: import("@grafana/data").FieldWithIndex | undefined;
    details: Field<any, import("@grafana/data").Vector<any>>[];
};
export declare enum DataFrameFieldNames {
    id = "id",
    title = "title",
    subTitle = "subTitle",
    mainStat = "mainStat",
    secondaryStat = "secondaryStat",
    source = "source",
    target = "target",
    detail = "detail__",
    arc = "arc__"
}
/**
 * Transform nodes and edges dataframes into array of objects that the layout code can then work with.
 */
export declare function processNodes(nodes?: DataFrame, edges?: DataFrame): {
    nodes: NodeDatum[];
    edges: EdgeDatum[];
};
/**
 * Utilities mainly for testing
 */
export declare function makeNodesDataFrame(count: number): MutableDataFrame<any>;
export declare function makeEdgesDataFrame(edges: Array<[number, number]>): MutableDataFrame<any>;
export {};
