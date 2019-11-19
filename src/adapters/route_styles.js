import Color from 'color';

const darkenColor = hex => Color(hex).mix(Color('black'), 0.33).hex();

const INACTIVE_ROUTE_COLOR = '#c8cbd3';
const ACTIVE_ROUTE_COLOR = '#4ba2ea';
const DYNAMIC_COLOR_EXPRESSION = ['case', ['has', 'lineColor'],
  ['concat', '#', ['get', 'lineColor']],
  ACTIVE_ROUTE_COLOR,
];
const INACTIVE_ROUTE_COLOR_OUTLINE = darkenColor(INACTIVE_ROUTE_COLOR);
const ACTIVE_ROUTE_COLOR_OUTLINE = darkenColor(ACTIVE_ROUTE_COLOR);

export function getOutlineFeature(feature) {
  const properties = { ...feature.properties };
  properties.lineColor = properties.lineColor
    ? darkenColor('#' + properties.lineColor).substring(1)
    : ACTIVE_ROUTE_COLOR_OUTLINE.substring(1);
  return {
    ...feature,
    properties,
  };
}

function getColorExpression(isActive, isOutline) {
  if (isActive) {
    return DYNAMIC_COLOR_EXPRESSION;
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
