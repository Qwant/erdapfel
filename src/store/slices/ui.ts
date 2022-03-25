/* eslint-disable @typescript-eslint/no-unused-vars */
import { getAppRelativePathname, updateQueryString } from 'src/libs/url_utils';
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

// TODO: Put in helpers
const getDrawerUrl = (drawer: MenuType | null) =>
  getAppRelativePathname() + updateQueryString({ drawer });

const onDrawerChange = (drawer: MenuType, isOpen: boolean) => {
  if (isOpen) {
    window?.app?.navigateTo(getDrawerUrl(drawer), window?.history?.state || {});
  } else {
    window?.app?.navigateTo(getDrawerUrl(null), window?.history?.state || {});
  }
};

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
