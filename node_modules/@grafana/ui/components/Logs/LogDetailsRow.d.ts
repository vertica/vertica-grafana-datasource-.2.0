import React from 'react';
import { Field, LinkModel, LogLabelStatsModel } from '@grafana/data';
import { Themeable } from '../../types/theme';
export interface Props extends Themeable {
    parsedValue: string;
    parsedKey: string;
    wrapLogMessage?: boolean;
    isLabel?: boolean;
    onClickFilterLabel?: (key: string, value: string) => void;
    onClickFilterOutLabel?: (key: string, value: string) => void;
    links?: Array<LinkModel<Field>>;
    getStats: () => LogLabelStatsModel[] | null;
    showDetectedFields?: string[];
    onClickShowDetectedField?: (key: string) => void;
    onClickHideDetectedField?: (key: string) => void;
}
export declare const LogDetailsRow: React.FunctionComponent<Pick<Props, "links" | "wrapLogMessage" | "isLabel" | "parsedValue" | "parsedKey" | "onClickFilterLabel" | "onClickFilterOutLabel" | "getStats" | "showDetectedFields" | "onClickShowDetectedField" | "onClickHideDetectedField">>;
