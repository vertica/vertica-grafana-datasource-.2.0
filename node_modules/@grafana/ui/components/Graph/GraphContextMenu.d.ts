import React from 'react';
import { ContextMenuProps } from '../ContextMenu/ContextMenu';
import { GraphDimensions } from './GraphTooltip/types';
import { FlotDataPoint, Dimensions, TimeZone, FormattedValue } from '@grafana/data';
export declare type ContextDimensions<T extends Dimensions = any> = {
    [key in keyof T]: [number, number | undefined] | null;
};
export declare type GraphContextMenuProps = ContextMenuProps & {
    getContextMenuSource: () => FlotDataPoint | null;
    timeZone?: TimeZone;
    dimensions?: GraphDimensions;
    contextDimensions?: ContextDimensions;
};
/** @internal */
export declare const GraphContextMenu: React.FC<GraphContextMenuProps>;
/** @internal */
export declare const GraphContextMenuHeader: ({ timestamp, seriesColor, displayName, displayValue, }: {
    timestamp: string;
    seriesColor: string;
    displayName: string;
    displayValue: FormattedValue;
}) => JSX.Element;
