import Color from 'color';

const darkenColor = hex => Color(hex).mix(Color('black'), 0.33).hex();
const safeHexColor = hex => hex.charAt(0) === '#' ? hex : `#${hex}`;

const ACTIVE_ROUTE_COLOR = '#3f81fb'; // action-blue-semi-lightness
const ACTIVE_ROUTE_COLOR_OUTLINE = '#1050c5'; // action-blue-dark
const INACTIVE_ROUTE_COLOR = '#c8cbd3';
const INACTIVE_ROUTE_COLOR_OUTLINE = darkenColor(INACTIVE_ROUTE_COLOR);

export function prepareRouteColor(feature) {
  const lineColor = feature.properties?.lineColor;
  return {
    ...feature,
    properties: {
      ...feature.properties,
      lineColor: lineColor ? safeHexColor(lineColor) : ACTIVE_ROUTE_COLOR,
      outlineColor: lineColor ? darkenColor(safeHexColor(lineColor)) : ACTIVE_ROUTE_COLOR_OUTLINE,
    },
  };
}

function getColorExpression(isActive, isOutline) {
  if (isActive) {
    return isOutline ? ['get', 'outlineColor'] : ['get', 'lineColor'];
  }
  return isOutline ? INACTIVE_ROUTE_COLOR_OUTLINE : INACTIVE_ROUTE_COLOR;
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
      'visibility': 'visible',
    },
    paint: {
      'line-color': getColorExpression(isActive, isOutline),
      'line-color-transition': { 'duration': 0 },
      'line-width': isOutline ? 7 : 5,
    },
  };
}

export function setActiveRouteStyle(map, layerId, vehicle, isActive, isOutline) {
  if (vehicle === 'walking') {
    map.setLayoutProperty(layerId, 'icon-image',
      isActive ? 'walking_bullet_active' : 'walking_bullet_inactive');
  } else {
    map.setPaintProperty(layerId, 'line-color', getColorExpression(isActive, isOutline));
  }
}
