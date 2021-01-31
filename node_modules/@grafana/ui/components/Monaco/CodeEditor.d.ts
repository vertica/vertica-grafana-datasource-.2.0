import React from 'react';
import { Themeable } from '../../types';
import { CodeEditorProps } from './types';
declare type Props = CodeEditorProps & Themeable;
declare const _default: React.FunctionComponent<Pick<Props, "value" | "onBlur" | "readOnly" | "height" | "width" | "language" | "showMiniMap" | "showLineNumbers" | "onEditorDidMount" | "onSave" | "getSuggestions">>;
export default _default;
