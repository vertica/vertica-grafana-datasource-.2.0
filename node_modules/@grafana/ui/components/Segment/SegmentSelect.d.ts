import React, { HTMLProps } from 'react';
import { SelectableValue } from '@grafana/data';
export interface Props<T> extends Omit<HTMLProps<HTMLDivElement>, 'value' | 'onChange'> {
    value?: SelectableValue<T>;
    options: Array<SelectableValue<T>>;
    onChange: (item: SelectableValue<T>) => void;
    onClickOutside: () => void;
    width: number;
    noOptionsMessage?: string;
    allowCustomValue?: boolean;
}
export declare function SegmentSelect<T>({ value, options, onChange, onClickOutside, width, noOptionsMessage, allowCustomValue, ...rest }: React.PropsWithChildren<Props<T>>): JSX.Element;
