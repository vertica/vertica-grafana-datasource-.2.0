/// <reference types="react" />
import { Themeable } from '../../types/index';
export interface NamedColorsPaletteProps extends Themeable {
    color?: string;
    onChange: (colorName: string) => void;
}
export declare const NamedColorsPalette: ({ color, onChange, theme }: NamedColorsPaletteProps) => JSX.Element;
