import { GrafanaTheme, GrafanaThemeType } from '../types/theme';
declare type Hue = 'green' | 'yellow' | 'red' | 'blue' | 'orange' | 'purple';
export declare type Color = 'green' | 'dark-green' | 'semi-dark-green' | 'light-green' | 'super-light-green' | 'yellow' | 'dark-yellow' | 'semi-dark-yellow' | 'light-yellow' | 'super-light-yellow' | 'red' | 'dark-red' | 'semi-dark-red' | 'light-red' | 'super-light-red' | 'blue' | 'dark-blue' | 'semi-dark-blue' | 'light-blue' | 'super-light-blue' | 'orange' | 'dark-orange' | 'semi-dark-orange' | 'light-orange' | 'super-light-orange' | 'purple' | 'dark-purple' | 'semi-dark-purple' | 'light-purple' | 'super-light-purple' | 'panel-bg';
declare type ThemeVariants = {
    dark: string;
    light: string;
};
export declare type ColorDefinition = {
    hue: Hue;
    isPrimary?: boolean;
    name: Color;
    variants: ThemeVariants;
};
export declare function getColorDefinitionByName(name: Color): ColorDefinition;
export declare function buildColorsMapForTheme(theme: GrafanaTheme): Record<Color, string>;
export declare function getColorForTheme(color: string, theme: GrafanaTheme): string;
/**
 * @deprecated use getColorForTheme
 */
export declare function getColorFromHexRgbOrName(color: string, type?: GrafanaThemeType): string;
export declare const getNamedColorPalette: () => Map<Hue, ColorDefinition[]>;
export declare const classicColors: string[];
export {};
