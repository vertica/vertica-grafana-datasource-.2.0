import { DataQueryError } from './datasource';
import { AngularPanelMenuItem } from './panel';
import { DataFrame } from './dataFrame';
import { BusEventBase, BusEventWithPayload } from '../events/types';
export declare type AlertPayload = [string, string?];
export declare type AlertErrorPayload = [string, (string | Error)?];
export declare const AppEvents: {
    alertSuccess: import("../events/types").AppEvent<AlertPayload>;
    alertWarning: import("../events/types").AppEvent<AlertPayload>;
    alertError: import("../events/types").AppEvent<AlertErrorPayload>;
};
export declare const PanelEvents: {
    refresh: import("../events/types").AppEvent<undefined>;
    componentDidMount: import("../events/types").AppEvent<undefined>;
    dataReceived: import("../events/types").AppEvent<any[]>;
    dataError: import("../events/types").AppEvent<DataQueryError>;
    dataFramesReceived: import("../events/types").AppEvent<DataFrame[]>;
    dataSnapshotLoad: import("../events/types").AppEvent<any[]>;
    editModeInitialized: import("../events/types").AppEvent<undefined>;
    initPanelActions: import("../events/types").AppEvent<AngularPanelMenuItem[]>;
    initialized: import("../events/types").AppEvent<undefined>;
    panelTeardown: import("../events/types").AppEvent<undefined>;
    render: import("../events/types").AppEvent<any>;
};
/** @public */
export interface LegacyGraphHoverEventPayload {
    pos: any;
    panel: {
        id: number;
    };
}
/** @alpha */
export declare class LegacyGraphHoverEvent extends BusEventWithPayload<LegacyGraphHoverEventPayload> {
    static type: string;
}
/** @alpha */
export declare class LegacyGraphHoverClearEvent extends BusEventBase {
    static type: string;
}
