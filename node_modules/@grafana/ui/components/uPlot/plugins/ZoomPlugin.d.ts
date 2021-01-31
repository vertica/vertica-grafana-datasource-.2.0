import React from 'react';
interface ZoomPluginProps {
    onZoom: (range: {
        from: number;
        to: number;
    }) => void;
}
/**
 * @alpha
 */
export declare const ZoomPlugin: React.FC<ZoomPluginProps>;
export {};
