/// <reference types="react" />
interface Props<Config> {
    config: Config;
    onConfigChange: (config: Config) => void;
    onPlus: () => void;
    onMinus: () => void;
    scale: number;
    disableZoomOut?: boolean;
    disableZoomIn?: boolean;
}
/**
 * Control buttons for zoom but also some layout config inputs mainly for debugging.
 */
export declare function ViewControls<Config extends Record<string, any>>(props: Props<Config>): JSX.Element;
export {};
