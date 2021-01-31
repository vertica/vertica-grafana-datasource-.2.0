import { Field, FieldColorModeId, GrafanaTheme, Threshold } from '../types';
import { RegistryItem } from '../utils';
import { Registry } from '../utils/Registry';
import { ColorScaleValue } from './scale';
export declare type FieldValueColorCalculator = (value: number, percent: number, Threshold?: Threshold) => string;
export interface FieldColorMode extends RegistryItem {
    getCalculator: (field: Field, theme: GrafanaTheme) => FieldValueColorCalculator;
    colors?: string[];
    isContinuous?: boolean;
    isByValue?: boolean;
}
export declare const fieldColorModeRegistry: Registry<FieldColorMode>;
interface FieldColorSchemeModeOptions {
    id: string;
    name: string;
    description?: string;
    colors: string[];
    isContinuous: boolean;
    isByValue: boolean;
}
export declare class FieldColorSchemeMode implements FieldColorMode {
    id: string;
    name: string;
    description?: string;
    colors: string[];
    isContinuous: boolean;
    isByValue: boolean;
    colorCache?: string[];
    interpolator?: (value: number) => string;
    constructor(options: FieldColorSchemeModeOptions);
    private getColors;
    private getInterpolator;
    getCalculator(field: Field, theme: GrafanaTheme): (_: number, percent: number, _threshold?: Threshold | undefined) => string;
}
export declare function getFieldColorModeForField(field: Field): FieldColorMode;
export declare function getFieldColorMode(mode?: FieldColorModeId): FieldColorMode;
/**
 * @alpha
 * Function that will return a series color for any given color mode. If the color mode is a by value color
 * mode it will use the field.config.color.seriesBy property to figure out which value to use
 */
export declare function getFieldSeriesColor(field: Field, theme: GrafanaTheme): ColorScaleValue;
export {};
