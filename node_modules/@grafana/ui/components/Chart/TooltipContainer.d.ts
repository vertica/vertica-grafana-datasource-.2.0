import React, { HTMLAttributes } from 'react';
interface TooltipContainerProps extends HTMLAttributes<HTMLDivElement> {
    position: {
        x: number;
        y: number;
    };
    offset: {
        x: number;
        y: number;
    };
    children?: JSX.Element;
}
export declare const TooltipContainer: React.FC<TooltipContainerProps>;
export {};
