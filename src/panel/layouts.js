import { layout } from 'config/constants.yml';

const DESKTOP_SIDE_PANEL = { top: 100, left: 450, right: 60, bottom: 45 };
const MOBILE_CARD = { top: 80, right: 70, bottom: 130, left: 20 };
const MOBILE_FULL_SCREEN_PANEL = { top: 184, right: 70, bottom: 130, left: 20 };

export function getMapPaddings({ isMobile, isDirectionsActive }) {
  if (!isMobile) {
    return DESKTOP_SIDE_PANEL;
  }
  return isDirectionsActive ? MOBILE_FULL_SCREEN_PANEL : MOBILE_CARD;
}

export function getMapCenterOffset({ isMobile }) {
  return isMobile
    ? [0, 0]
    : [(layout.sizes.panelWidth + layout.sizes.sideBarWidth) / 2, 0];
}

export function isPositionUnderPanel({ x }, { isMobile }) {
  return !isMobile && x < layout.sizes.sideBarWidth + layout.sizes.panelWidth;
}
