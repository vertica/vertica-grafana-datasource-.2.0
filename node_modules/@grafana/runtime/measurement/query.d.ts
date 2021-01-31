import { DataQueryResponse, LiveChannelAddress } from '@grafana/data';
import { LiveMeasurements, MeasurementsQuery } from './types';
import { Observable } from 'rxjs';
/**
 * @alpha -- experimental
 */
export declare function getLiveMeasurements(addr: LiveChannelAddress): LiveMeasurements | undefined;
/**
 * When you know the stream will be managed measurements
 *
 * @alpha -- experimental
 */
export declare function getLiveMeasurementsObserver(addr: LiveChannelAddress, requestId: string, query?: MeasurementsQuery): Observable<DataQueryResponse>;
