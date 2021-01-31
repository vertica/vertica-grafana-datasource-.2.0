import React, { MouseEvent } from 'react';
import { EdgeDatum, NodeDatum } from './types';
import { DataFrame, GrafanaTheme, LinkModel } from '@grafana/data';
/**
 * Hook that contains state of the context menu, both for edges and nodes and provides appropriate component when
 * opened context menu should be opened.
 */
export declare function useContextMenu(getLinks: (dataFrame: DataFrame, rowIndex: number) => LinkModel[], nodes: DataFrame, edges: DataFrame): {
    onEdgeOpen: (event: MouseEvent<SVGElement>, edge: EdgeDatum) => void;
    onNodeOpen: (event: MouseEvent<SVGElement>, node: NodeDatum) => void;
    MenuComponent: React.ReactNode;
};
export declare const getLabelStyles: (theme: GrafanaTheme) => {
    label: string;
    value: string;
};
