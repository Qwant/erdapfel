import { isMobileDevice } from 'src/libs/device';

// Mapbox paddings mobile / desktop
const DESKTOP_SIDE_PANEL = { top: 100, left: 450, right: 60, bottom: 45 };
const DESKTOP_FULL = { top: 100, left: 20, right: 60, bottom: 45 };
const MOBILE_FULL = { top: 80, right: 70, bottom: 45, left: 20 };
const MOBILE_CARD = { top: 80, right: 70, bottom: 130, left: 20 };
const MOBILE_FULL_SCREEN_PANEL = { top: 184, right: 70, bottom: 130, left: 20 };

export default {
  FULL: isMobileDevice() ? MOBILE_FULL : DESKTOP_FULL,
  FAVORITE: isMobileDevice() ? MOBILE_CARD : DESKTOP_SIDE_PANEL,
  LIST: isMobileDevice() ? MOBILE_CARD : DESKTOP_SIDE_PANEL,
  POI: isMobileDevice() ? MOBILE_CARD : DESKTOP_SIDE_PANEL,
  ITINERARY: isMobileDevice() ? MOBILE_FULL_SCREEN_PANEL : DESKTOP_SIDE_PANEL,
};
