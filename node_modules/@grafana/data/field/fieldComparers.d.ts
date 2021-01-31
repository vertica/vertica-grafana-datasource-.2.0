import { Field } from '../types/dataFrame';
declare type IndexComparer = (a: number, b: number) => number;
export declare const fieldIndexComparer: (field: Field, reverse?: boolean) => IndexComparer;
export declare const timeComparer: (a: any, b: any) => number;
export declare const numericComparer: (a: number, b: number) => number;
export declare const stringComparer: (a: string, b: string) => number;
export declare const booleanComparer: (a: boolean, b: boolean) => number;
export {};
