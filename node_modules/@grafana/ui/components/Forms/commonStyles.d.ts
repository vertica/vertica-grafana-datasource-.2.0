import { GrafanaTheme } from '@grafana/data';
import { ComponentSize } from '../../types/size';
export declare const getFocusStyle: (theme: GrafanaTheme) => string;
export declare const sharedInputStyle: (theme: GrafanaTheme, invalid?: boolean) => string;
export declare const inputSizes: () => {
    sm: string;
    md: string;
    lg: string;
    auto: string;
};
export declare const inputSizesPixels: (size: string) => "auto" | "200px" | "320px" | "580px";
export declare function getPropertiesForButtonSize(size: ComponentSize, theme: GrafanaTheme): {
    padding: number;
    fontSize: string;
    height: number;
};
