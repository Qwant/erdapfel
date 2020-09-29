// Compute a light rgba background color based on an icon's color
// Color is in #rrggbb format, background is #rrggbbaa where alpha is equal to '28' (0.157)
export const getLightBackground = color =>
  color + '28';
