import React, { PureComponent, FormEvent } from 'react';
import { TimeRange, TimeZone } from '@grafana/data';
import { Themeable } from '../../types';
export interface TimeRangePickerProps extends Themeable {
    hideText?: boolean;
    value: TimeRange;
    timeZone?: TimeZone;
    timeSyncButton?: JSX.Element;
    isSynced?: boolean;
    onChange: (timeRange: TimeRange) => void;
    onChangeTimeZone: (timeZone: TimeZone) => void;
    onMoveBackward: () => void;
    onMoveForward: () => void;
    onZoom: () => void;
    history?: TimeRange[];
    hideQuickRanges?: boolean;
}
export interface State {
    isOpen: boolean;
}
export declare class UnthemedTimeRangePicker extends PureComponent<TimeRangePickerProps, State> {
    state: State;
    onChange: (timeRange: TimeRange) => void;
    onOpen: (event: FormEvent<HTMLButtonElement>) => void;
    onClose: () => void;
    render(): JSX.Element;
}
export declare const TimePickerButtonLabel: React.NamedExoticComponent<Pick<TimeRangePickerProps, "value" | "timeZone" | "hideText">>;
export declare const TimeRangePicker: React.FunctionComponent<Pick<TimeRangePickerProps, "value" | "timeZone" | "onChange" | "history" | "onChangeTimeZone" | "hideQuickRanges" | "hideText" | "timeSyncButton" | "isSynced" | "onMoveBackward" | "onMoveForward" | "onZoom">>;
