import React from 'react';
import { MenuItemsGroup } from '../Menu/Menu';
export interface ContextMenuProps {
    /** Starting horizontal position for the menu */
    x: number;
    /** Starting vertical position for the menu */
    y: number;
    /** Callback for closing the menu */
    onClose?: () => void;
    /** List of the menu items to display */
    items?: MenuItemsGroup[];
    /** A function that returns header element */
    renderHeader?: () => React.ReactNode;
}
export declare const ContextMenu: React.FC<ContextMenuProps>;
