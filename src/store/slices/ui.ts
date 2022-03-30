/* eslint-disable @typescript-eslint/no-unused-vars */
import { onDrawerChange } from 'src/libs/url_utils';
import { MenuType } from 'src/panel/Menu';
import { GetState, State } from 'zustand';
import { NamedSet } from 'zustand/middleware';
import { AppState } from '..';

export interface UiSlice extends State {
  isMenuDrawerOpen: boolean;
  isProductsDrawerOpen: boolean;
  setMenuDrawerOpen: (isOpen: boolean) => void;
  setProductsDrawerOpen: (isOpen: boolean) => void;
}

export const createUiSlice = (set: NamedSet<AppState>, get: GetState<AppState>): UiSlice => ({
  isMenuDrawerOpen: false,
  isProductsDrawerOpen: false,
  setMenuDrawerOpen: isOpen =>
    set(
      () => {
        onDrawerChange(MenuType.MENU, isOpen);
        return { isMenuDrawerOpen: isOpen };
      },
      false,
      'UI/setMenuDrawerOpen'
    ),
  setProductsDrawerOpen: isOpen =>
    set(
      () => {
        onDrawerChange(MenuType.PRODUCTS, isOpen);
        return { isProductsDrawerOpen: isOpen };
      },
      false,
      'UI/setProductsDrawerOpen'
    ),
});
