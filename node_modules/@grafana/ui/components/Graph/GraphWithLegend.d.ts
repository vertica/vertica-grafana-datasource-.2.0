import React from 'react';
import { GraphProps } from './Graph';
import { LegendDisplayMode, SeriesColorChangeHandler, LegendPlacement } from '../VizLegend/types';
export interface GraphWithLegendProps extends GraphProps {
    legendDisplayMode: LegendDisplayMode;
    placement: LegendPlacement;
    hideEmpty?: boolean;
    hideZero?: boolean;
    sortLegendBy?: string;
    sortLegendDesc?: boolean;
    onSeriesColorChange?: SeriesColorChangeHandler;
    onSeriesToggle?: (label: string, event: React.MouseEvent<HTMLElement>) => void;
    onToggleSort: (sortBy: string) => void;
}
export declare const GraphWithLegend: React.FunctionComponent<GraphWithLegendProps>;
