// Compute a light rgba background color based on an icon's rgb color
// Color is in #rrggbb format, background is #rrggbbaa where alpha is equal to '28' (0.157)
export const getLightBackground = color =>
  color + '28';

export const ACTION_BLUE_BASE = '#1a6aff';
export const ACTION_BLUE_DARK = '#1050c5';
export const ACTION_BLUE_SEMI_LIGHTNESS = '#3f81fb';
export const PINK_DARK = '#cd1690';
export const PINK_LIGHTER = '#fbd9ef';
export const GREY_GREY = '#898991';
export const GREY_SEMI_LIGHTNESS = '#c4c4cc';
export const GREY_BLACK = '#0c0c0e';
export const GREEN_BASE = '#83c458';
export const GREEN_DARK = '#5d9836';
export const ORANGE_BASE = '#ff851e';
export const RED_BASE = '#ff1d3c';
export const RED_DARKER = '#900014';
