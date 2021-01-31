import React from 'react';
import { PlotProps } from './types';
/**
 * @internal
 * uPlot abstraction responsible for plot initialisation, setup and refresh
 * Receives a data frame that is x-axis aligned, as of https://github.com/leeoniya/uPlot/tree/master/docs#data-format
 * Exposes contexts for plugins registration and uPlot instance access
 */
export declare const UPlotChart: React.FC<PlotProps>;
