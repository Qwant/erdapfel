/* eslint-disable @typescript-eslint/no-unused-vars */
import { onDrawerChange } from 'src/libs/url_utils';
import { MenuType } from 'src/panel/Menu';
import { GetState, State } from 'zustand';
import { NamedSet } from 'zustand/middleware';
import { modes } from 'src/adapters/direction_api';
import { AppState } from '..';
import { fire } from 'src/libs/customEvents';

export interface UiSlice extends State {
  isMapillaryViewerOpen: boolean;
  mapillaryImageId: string;
  isMenuDrawerOpen: boolean;
  isMapillaryLayerVisible: boolean;
  isProductsDrawerOpen: boolean;
  isSearchInputTyping: boolean;
  defaultVehicle: string;
  setMapillaryViewerOpen: (isOpen: boolean) => void;
  setMapillaryImageId: (mapillaryImageId: string) => void;
  setMenuDrawerOpen: (isOpen: boolean) => void;
  setMapillaryLayerVisible: (isVisible: boolean) => void;
  setProductsDrawerOpen: (isOpen: boolean) => void;
  setSearchInputTyping: (isSearchInputTyping: boolean) => void;
  setDefaultVehicle: (defaultVehicle: string) => void;
}

export const createUiSlice = (set: NamedSet<AppState>, get: GetState<AppState>): UiSlice => ({
  isMapillaryViewerOpen: false,
  isMapillaryLayerVisible: false,
  mapillaryImageId: '498763468214164',
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
  setMapillaryLayerVisible: isMapillaryLayerVisible =>
    set(
      () => {
        fire('update_mapillary_visible', isMapillaryLayerVisible);
        return { isMapillaryLayerVisible };
      },
      false,
      'UI/setMapillaryLayerVisible'
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
  setMapillaryImageId: mapillaryImageId =>
    set(
      () => {
        return { mapillaryImageId };
      },
      false,
      'UI/setmapillaryImageId'
    ),
});
