import { isMobileDevice } from '../libs/device';

const DESKTOP_PANEL_WIDTH = 400;
const MOBILE_BOTTOM_PADDING = 180;
const ADDITIONAL_PADDING = 50;
const DESKTOP_SIDE_PANEL = {
  top: ADDITIONAL_PADDING,
  left: DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING,
  right: 60,
  bottom: 45,
};

function computeMapPaddings({ isMobile, isDirectionsActive, isIframe }) {
  // iframe: no paddings
  if (isIframe) {
    return { bottom: 0, top: 0, left: 0, right: 0 };
  }
  if (!isMobile) {
    return DESKTOP_SIDE_PANEL;
  }
  const topUIElement = isDirectionsActive ? '.direction-panel' : '.top_bar';
  const topUIHeight = document.querySelector(topUIElement)?.clientHeight || 0;
  return {
    bottom: MOBILE_BOTTOM_PADDING,
    top: topUIHeight + ADDITIONAL_PADDING / 2,
    right: 20,
    left: 20,
  };
}

export const getCurrentMapPaddings = () =>
  computeMapPaddings({
    isMobile: isMobileDevice(),
    isDirectionsActive: !!document.querySelector('.directions-open'),
    isIframe: window.no_ui,
  });

export function getVisibleBbox(mb, isIframe) {
  const bbox = mb.getBounds();
  let ne = bbox.getNorthEast();
  let sw = bbox.getSouthWest();
  const ne_canvas = mb.project(ne);
  const sw_canvas = mb.project(sw);

  // iframe: no offset
  if (!isIframe) {
    if (isMobileDevice()) {
      // On mobile, compute a bbox that excludes the header's height
      ne_canvas.y += 65;
    } else {
      // On desktop, compute a bbox that excludes the left panel's width
      sw_canvas.x += DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING / 2;
    }
  }

  ne = mb.unproject(ne_canvas);
  sw = mb.unproject(sw_canvas);
  bbox.setNorthEast(ne);
  bbox.setSouthWest(sw);
  return bbox;
}

export function isPositionUnderUI({ x, y }, { isMobile }) {
  return !isMobile && (x < DESKTOP_PANEL_WIDTH + ADDITIONAL_PADDING || y < ADDITIONAL_PADDING);
}
