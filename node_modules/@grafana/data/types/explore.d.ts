import { RawTimeRange } from './time';
/** @internal */
export interface ExploreUrlState {
    datasource: string;
    queries: any[];
    range: RawTimeRange;
    originPanelId?: number;
    context?: string;
}
