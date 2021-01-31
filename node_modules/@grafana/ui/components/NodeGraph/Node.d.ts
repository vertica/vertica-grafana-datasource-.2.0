import React, { MouseEvent } from 'react';
import { NodeDatum } from './types';
export declare const Node: React.NamedExoticComponent<{
    node: NodeDatum;
    onMouseEnter: (id: string) => void;
    onMouseLeave: (id: string) => void;
    onClick: (event: MouseEvent<SVGElement>, node: NodeDatum) => void;
    hovering: boolean;
}>;
