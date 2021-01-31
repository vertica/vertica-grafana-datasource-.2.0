import React from 'react';
import { GrafanaTheme } from '@grafana/data';
export interface FieldValidationMessageProps {
    children: string;
    /** Override component style */
    className?: string;
    horizontal?: boolean;
}
export declare const getFieldValidationMessageStyles: (theme: GrafanaTheme) => {
    vertical: string;
    horizontal: string;
    fieldValidationMessageIcon: string;
};
export declare const FieldValidationMessage: React.FC<FieldValidationMessageProps>;
