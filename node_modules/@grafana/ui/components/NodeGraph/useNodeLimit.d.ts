import { EdgeDatum, NodeDatum } from './types';
/**
 * Limits the number of nodes by going from the roots breadth first until we have desired number of nodes.
 * TODO: there is some possible perf gains as some of the processing is the same as in layout and so we do double
 *  the work.
 */
export declare function useNodeLimit(nodes: NodeDatum[], edges: EdgeDatum[], limit: number): {
    nodes: NodeDatum[];
    edges: EdgeDatum[];
};
