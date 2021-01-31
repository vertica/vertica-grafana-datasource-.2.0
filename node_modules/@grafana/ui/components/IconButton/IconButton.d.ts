import React from 'react';
import { IconName, IconSize, IconType } from '../../types/icon';
import { TooltipPlacement } from '../Tooltip/PopoverController';
export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Name of the icon **/
    name: IconName;
    /** Icon size */
    size?: IconSize;
    /** Need this to change hover effect based on what surface it is on */
    surface?: SurfaceType;
    /** Type od the icon - mono or default */
    iconType?: IconType;
    /** Tooltip content to display on hover */
    tooltip?: string;
    /** Position of the tooltip */
    tooltipPlacement?: TooltipPlacement;
}
declare type SurfaceType = 'dashboard' | 'panel' | 'header';
export declare const IconButton: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLButtonElement>>;
export {};
