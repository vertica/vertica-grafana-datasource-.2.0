/// <reference types="react" />
interface Options {
    /**
     * Allows you to specify how the step up will be handled so you can do fractional steps based on previous value.
     */
    stepUp: (scale: number) => number;
    stepDown: (scale: number) => number;
    /**
     * Set max and min values. If stepUp/down overshoots these bounds this will return min or max but internal scale value
     * will still be what ever the step functions returned last.
     */
    min?: number;
    max?: number;
}
/**
 * Keeps state and returns handlers that can be used to implement zooming functionality ideally by using it with
 * 'transform: scale'. It returns handler for manual buttons with zoom in/zoom out function and a ref that can be
 * used to zoom in/out with mouse wheel.
 */
export declare function useZoom({ stepUp, stepDown, min, max }?: Options): {
    onStepUp: () => void;
    onStepDown: () => void;
    scale: number;
    isMax: boolean;
    isMin: boolean;
    ref: import("react").RefObject<HTMLElement>;
};
export {};
