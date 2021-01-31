import { GrafanaTheme } from '@grafana/data';
export declare const getFocusStyle: (theme: GrafanaTheme) => string;
export declare const getStyles: (theme: GrafanaTheme, isHorizontal: boolean) => {
    container: string;
    slider: string;
    /** Global component from @emotion/core doesn't accept computed classname string returned from css from emotion.
     * It accepts object containing the computed name and flattened styles returned from css from @emotion/core
     * */
    tooltip: import("@emotion/utils").SerializedStyles;
    sliderInput: string;
    sliderInputVertical: string;
    sliderInputField: string;
    sliderInputFieldVertical: string;
};
