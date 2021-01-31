import { FieldColorMode, GrafanaTheme, ThresholdsConfig } from '@grafana/data';
import uPlot from 'uplot';
export declare function getOpacityGradientFn(color: string, opacity: number): (self: uPlot, seriesIdx: number) => CanvasGradient;
export declare function getHueGradientFn(color: string, opacity: number, theme: GrafanaTheme): (self: uPlot, seriesIdx: number) => CanvasGradient;
/**
 * Experimental & quick and dirty test
 * Not being used
 */
export declare function getScaleGradientFn(opacity: number, colorMode?: FieldColorMode, thresholds?: ThresholdsConfig): (self: uPlot, seriesIdx: number) => CanvasGradient;
