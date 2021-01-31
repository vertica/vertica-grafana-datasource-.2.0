import React, { MouseEvent } from 'react';
import { EdgeDatum } from './types';
interface Props {
    edge: EdgeDatum;
    hovering: boolean;
    onClick: (event: MouseEvent<SVGElement>, link: EdgeDatum) => void;
    onMouseEnter: (id: string) => void;
    onMouseLeave: (id: string) => void;
}
export declare const Edge: React.NamedExoticComponent<Props>;
export {};
