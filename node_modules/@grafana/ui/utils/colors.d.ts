import { GrafanaTheme } from '@grafana/data';
import { AlertVariant } from '../components/Alert/Alert';
/**
 * @alpha
 */
export declare const DEFAULT_ANNOTATION_COLOR = "rgba(0, 211, 255, 1)";
/**
 * @alpha
 */
export declare const OK_COLOR = "rgba(11, 237, 50, 1)";
/**
 * @alpha
 */
export declare const ALERTING_COLOR = "rgba(237, 46, 24, 1)";
/**
 * @alpha
 */
export declare const NO_DATA_COLOR = "rgba(150, 150, 150, 1)";
/**
 * @alpha
 */
export declare const PENDING_COLOR = "rgba(247, 149, 32, 1)";
/**
 * @alpha
 */
export declare const REGION_FILL_ALPHA = 0.09;
export declare const colors: string[];
export declare function getTextColorForBackground(color: string): string;
export declare let sortedColors: string[];
/**
 * Returns colors used for severity color coding. Use for single color retrievel(0 index) or gradient definition
 * @internal
 **/
export declare function getColorsFromSeverity(severity: AlertVariant, theme: GrafanaTheme): [string, string];
