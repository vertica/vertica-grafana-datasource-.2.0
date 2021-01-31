import { CircularDataFrame, Labels, DataFrame } from '@grafana/data';
import { Measurement, MeasurementBatch, LiveMeasurements, MeasurementsQuery, MeasurementAction } from './types';
interface MeasurementCacheConfig {
    append?: 'head' | 'tail';
    capacity?: number;
}
/** This is a cache scoped to a the measurement name
 *
 * @alpha -- experimental
 */
export declare class MeasurementCache {
    name: string;
    private config;
    readonly frames: Record<string, CircularDataFrame>;
    constructor(name: string, config: MeasurementCacheConfig);
    getFrames(match?: Labels): DataFrame[];
    addMeasurement(m: Measurement, action: MeasurementAction): DataFrame;
}
/**
 * @alpha -- experimental
 */
export declare class MeasurementCollector implements LiveMeasurements {
    measurements: Map<string, MeasurementCache>;
    config: MeasurementCacheConfig;
    getData(query?: MeasurementsQuery): DataFrame[];
    getDistinctNames(): string[];
    getDistinctLabels(name: string): Labels[];
    setCapacity(size: number): void;
    getCapacity(): number;
    clear(): void;
    addBatch: (batch: MeasurementBatch) => this;
}
export {};
