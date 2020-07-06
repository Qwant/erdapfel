import { isMobileDevice } from '../libs/device';

const DESKTOP_PANEL_WIDTH = 400;
const ADDITIONAL_PADDING = 50;
const DESKTOP_SIDE_PANEL = {
  top: ADDITIONAL_PADDING,
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
  if (isDirectionsActive) {
    const resultPanel = document.querySelector('.directionResult_panel');
    const bottomPadding = resultPanel
      ? resultPanel.clientHeight + (ADDITIONAL_PADDING / 2)
      : MOBILE_FULL_SCREEN_PANEL.bottom;
    return { ...MOBILE_FULL_SCREEN_PANEL, bottom: bottomPadding };
  }
  return MOBILE_CARD;
}

export function getVisibleBbox(mb) {

  const bbox = mb.getBounds();
  let ne = bbox.getNorthEast();
  let sw = bbox.getSouthWest();
  const ne_canvas = mb.project(ne);
  const sw_canvas = mb.project(sw);

  if (isMobileDevice()) {
    // On mobile, compute a bbox that excludes the header's height
    ne_canvas.y += 65;
  } else {
    // On desktop, compute a bbox that excludes the left panel's width
    sw_canvas.x += DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING / 2;
  }

  ne = mb.unproject(ne_canvas);
  sw = mb.unproject(sw_canvas);
  bbox.setNorthEast(ne);
  bbox.setSouthWest(sw);
  return bbox;
}

export function getMapCenterOffset({ isMobile }) {
  return isMobile ? [0, 0] : [(DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING) / 2, 0];
}

export function isPositionUnderUI({ x, y }, { isMobile }) {
  return !isMobile && (
    x < (DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING)
    ||
    y < ADDITIONAL_PADDING
  );
}
