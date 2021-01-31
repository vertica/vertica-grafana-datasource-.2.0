import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
export declare type NodeDatum = SimulationNodeDatum & {
    id: string;
    title: string;
    subTitle: string;
    dataFrameRowIndex: number;
    incoming: number;
    mainStat: string;
    secondaryStat: string;
    arcSections: Array<{
        value: number;
        color: string;
    }>;
};
export declare type EdgeDatum = SimulationLinkDatum<NodeDatum> & {
    id: string;
    mainStat: string;
    secondaryStat: string;
    dataFrameRowIndex: number;
};
