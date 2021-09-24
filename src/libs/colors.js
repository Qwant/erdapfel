import Color from 'color';

// Compute a light, non-transparent background color based on an icon's color
export const getLightBackground = color => Color(color).mix(Color('white'), 0.85).hex();

export const ACTION_BLUE_BASE = '#1a6aff';
export const ACTION_BLUE_DARK = '#1050c5';
export const ACTION_BLUE_SEMI_LIGHTNESS = '#3f81fb';
export const PINK_DARK = '#cd1690';
export const PINK_LIGHTER = '#fbd9ef';
export const GREY_GREY = '#898991';
export const GREY_SEMI_LIGHTNESS = '#c4c4cc';
export const GREY_SEMI_DARKNESS = '#59595f';
export const GREY_BLACK = '#0c0c0e';
export const GREEN_BASE = '#83c458';
export const GREEN_DARK = '#5d9836';
export const ORANGE_BASE = '#ff851e';
export const RED_BASE = '#ff1d3c';
export const RED_DARKER = '#900014';
export const PURPLE_LIGHTER = '#f2dbf8';
export const PURPLE_DARK = '#a125be';
