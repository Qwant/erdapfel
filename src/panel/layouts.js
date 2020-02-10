
const DESKTOP_PANEL_WIDTH = 400;
const DESKTOP_TOP_BAR_HEIGHT = 100;
const ADDITIONAL_PADDING = 50;
const DESKTOP_SIDE_PANEL = {
  top: DESKTOP_TOP_BAR_HEIGHT + ADDITIONAL_PADDING,
  left: DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING,
  right: 60,
  bottom: 45,
};
const MOBILE_CARD = { top: 80, right: 70, bottom: 130, left: 20 };
const MOBILE_FULL_SCREEN_PANEL = { top: 184, right: 70, bottom: 130, left: 20 };

export function getMapPaddings({ isMobile, isDirectionsActive }) {
  if (!isMobile) {
    return DESKTOP_SIDE_PANEL;
  }
  return isDirectionsActive ? MOBILE_FULL_SCREEN_PANEL : MOBILE_CARD;
}

export function getMapCenterOffset({ isMobile }) {
  return isMobile ? [0, 0] : [(DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING) / 2, 0];
}

export function isPositionUnderUI({ x, y }, { isMobile }) {
  return !isMobile && (
    x < (DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING)
    ||
    y < (DESKTOP_TOP_BAR_HEIGHT + ADDITIONAL_PADDING)
  );
}
