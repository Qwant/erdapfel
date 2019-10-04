const INACTIVE_ROUTE_COLOR = '#c8cbd3';
const ACTIVE_ROUTE_COLOR = '#4ba2ea';
const DYNAMIC_COLOR_EXPRESSION = ['case', ['has', 'lineColor'],
  ['concat', '#', ['get', 'lineColor']],
  ACTIVE_ROUTE_COLOR,
];

export function getRouteStyle(vehicle, isActive) {
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
      'line-color': isActive ? DYNAMIC_COLOR_EXPRESSION : INACTIVE_ROUTE_COLOR,
      'line-color-transition': { 'duration': 0 },
      'line-width': 7,
    },
  };
}

export function setActiveRouteStyle(map, layerId, vehicle, isActive) {
  if (vehicle === 'walking') {
    map.setLayoutProperty(layerId, 'icon-image',
      isActive ? 'walking_bullet_active' : 'walking_bullet_inactive');
  } else {
    map.setPaintProperty(layerId, 'line-color',
      isActive ? DYNAMIC_COLOR_EXPRESSION : INACTIVE_ROUTE_COLOR);
  }
}
