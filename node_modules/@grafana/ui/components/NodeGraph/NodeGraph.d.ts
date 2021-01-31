/// <reference types="react" />
import { DataFrame, LinkModel } from '@grafana/data';
interface Props {
    dataFrames: DataFrame[];
    getLinks: (dataFrame: DataFrame, rowIndex: number) => LinkModel[];
    nodeLimit?: number;
}
export declare function NodeGraph({ getLinks, dataFrames, nodeLimit }: Props): JSX.Element;
export {};
