import { DataFrame } from '@grafana/data';
import React from 'react';
interface EventsCanvasProps {
    id: string;
    events: DataFrame[];
    renderEventMarker: (dataFrame: DataFrame, index: number) => React.ReactNode;
    mapEventToXYCoords: (dataFrame: DataFrame, index: number) => {
        x: number;
        y: number;
    } | undefined;
}
export declare function EventsCanvas({ id, events, renderEventMarker, mapEventToXYCoords }: EventsCanvasProps): JSX.Element | null;
export {};
