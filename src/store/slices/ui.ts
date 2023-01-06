/* eslint-disable @typescript-eslint/no-unused-vars */
import { onDrawerChange } from 'src/libs/url_utils';
import { MenuType } from 'src/panel/Menu';
import { GetState, State } from 'zustand';
import { NamedSet } from 'zustand/middleware';
import { modes } from 'src/adapters/direction_api';
import { AppState } from '..';

export interface UiSlice extends State {
  isMapillaryViewerOpen: boolean;
  isMenuDrawerOpen: boolean;
  isProductsDrawerOpen: boolean;
  isSearchInputTyping: boolean;
  defaultVehicle: string;
  setMapillaryViewerOpen: (isOpen: boolean) => void;
  setMenuDrawerOpen: (isOpen: boolean) => void;
  setProductsDrawerOpen: (isOpen: boolean) => void;
  setSearchInputTyping: (isSearchInputTyping: boolean) => void;
  setDefaultVehicle: (defaultVehicle: string) => void;
}

export const createUiSlice = (set: NamedSet<AppState>, get: GetState<AppState>): UiSlice => ({
  isMapillaryViewerOpen: false,
  isMenuDrawerOpen: false,
  isProductsDrawerOpen: false,
  isSearchInputTyping: false,
  defaultVehicle: modes.DRIVING,
  setMapillaryViewerOpen: isMapillaryOpen =>
    set(
      () => {
        return { isMapillaryViewerOpen: isMapillaryOpen };
      },
      false,
      'UI/setMapillaryOpen'
    ),
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
  setSearchInputTyping: isSearchInputTyping =>
    set(
      () => {
        return { isSearchInputTyping };
      },
      false,
      'UI/setSearchInputTyping'
    ),
  setDefaultVehicle: defaultVehicle =>
    set(
      () => {
        return { defaultVehicle };
      },
      false,
      'UI/setDefaultVehicle'
    ),
});
