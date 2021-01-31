import { EdgeDatum, NodeDatum } from './types';
export interface Config {
    linkDistance: number;
    linkStrength: number;
    forceX: number;
    forceXStrength: number;
    forceCollide: number;
    tick: number;
}
export declare const defaultConfig: Config;
/**
 * This will return copy of the nods and edges with x,y positions filled in. Also the layout changes source/target props
 * in edges from string ids to actual nodes.
 * TODO: the typing could probably be done better so it's clear that props are filled in after the layout
 */
export declare function useLayout(rawNodes: NodeDatum[], rawEdges: EdgeDatum[], config?: Config): {
    bounds: Bounds;
    nodes: NodeDatum[];
    edges: EdgeDatum[];
};
export interface Bounds {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
