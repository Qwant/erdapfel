import Color from 'color';

export const getLightBackground = (color: string) => Color(color).mix(Color('white'), 0.85).hex();

export const ACTION_BLUE_BASE = '#1a6aff';
export const GREY_SEMI_DARKNESS = '#59595f';
export const GREY_DARK = '#46464c';
export const GREY_BLACK = '#0c0c0e';
export const RED_DARKER = '#900014';
export const PURPLE = '#a125be';
