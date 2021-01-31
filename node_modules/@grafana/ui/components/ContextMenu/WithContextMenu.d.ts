import React from 'react';
import { MenuItemsGroup } from '../Menu/Menu';
interface WithContextMenuProps {
    /** Menu item trigger that accepts openMenu prop */
    children: (props: {
        openMenu: React.MouseEventHandler<HTMLElement>;
    }) => JSX.Element;
    /** A function that returns an array of menu items */
    getContextMenuItems: () => MenuItemsGroup[];
}
export declare const WithContextMenu: React.FC<WithContextMenuProps>;
export {};
