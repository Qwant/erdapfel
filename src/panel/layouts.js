import { isMobileDevice } from '../libs/device';
import { listen } from 'src/libs/customEvents';

const DESKTOP_PANEL_WIDTH = 400;
const ADDITIONAL_PADDING = 50;
const DESKTOP_SIDE_PANEL = {
  top: ADDITIONAL_PADDING,
  left: DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING,
  right: 60,
  bottom: 45,
};

let mobileBottomPanelHeight = 0;
listen('move_mobile_bottom_ui', height => {
  mobileBottomPanelHeight = height;
});

export function getMapPaddings({ isMobile, isDirectionsActive }) {
  if (!isMobile) {
    return DESKTOP_SIDE_PANEL;
  }
  const topUIElement = isDirectionsActive
    ? '.direction-panel'
    : '.top_bar';
  const topUIHeight = document.querySelector(topUIElement)?.clientHeight || 0;
  return {
    bottom: mobileBottomPanelHeight + ADDITIONAL_PADDING / 2,
    top: topUIHeight + ADDITIONAL_PADDING / 2,
    right: 70,
    left: 20,
  };
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
