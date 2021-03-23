import Color from 'color';
import {
  ACTION_BLUE_SEMI_LIGHTNESS,
  ACTION_BLUE_DARK,
  GREY_GREY,
  GREY_SEMI_LIGHTNESS,
} from 'src/libs/colors';

const darkenColor = hex => Color(hex).mix(Color('black'), 0.33).hex();
const safeHexColor = hex => (hex.charAt(0) === '#' ? hex : `#${hex}`);

export function prepareRouteColor(feature) {
  const lineColor = feature.properties?.lineColor;
  return {
    ...feature,
    properties: {
      ...feature.properties,
      lineColor: lineColor ? safeHexColor(lineColor) : ACTION_BLUE_SEMI_LIGHTNESS,
      outlineColor: lineColor ? darkenColor(safeHexColor(lineColor)) : ACTION_BLUE_DARK,
    },
  };
}

function getColorExpression(isActive, isOutline) {
  if (isActive) {
    return isOutline ? ['get', 'outlineColor'] : ['get', 'lineColor'];
  }
  return isOutline ? GREY_GREY : GREY_SEMI_LIGHTNESS;
}

export function getRouteStyle(vehicle, isActive, isOutline) {
  if (vehicle === 'walking') {
    return {
      type: 'symbol',
      layout: {
        'icon-image': isActive ? 'walking_bullet_active' : 'walking_bullet_inactive',
        'symbol-placement': 'line',
        'symbol-spacing': 12,
        'icon-ignore-placement': true,
        'icon-allow-overlap': true,
        'symbol-avoid-edges': true,
      },
    };
  }

  return {
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
      visibility: 'visible',
    },
    paint: {
      'line-color': getColorExpression(isActive, isOutline),
      'line-color-transition': { duration: 0 },
      'line-width': isOutline ? 7 : 5,
    },
  };
}

export function setActiveRouteStyle(map, layerId, vehicle, isActive, isOutline) {
  if (vehicle === 'walking') {
    map.setLayoutProperty(
      layerId,
      'icon-image',
      isActive ? 'walking_bullet_active' : 'walking_bullet_inactive'
    );
  } else {
    map.setPaintProperty(layerId, 'line-color', getColorExpression(isActive, isOutline));
  }
}
