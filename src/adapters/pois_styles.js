
export const getFilteredPoisPinStyle = () => ({
  type: 'symbol',
  layout: {
    'icon-image': ['concat', 'pin-', ['get', 'iconName']],
    'icon-allow-overlap': true,
    'icon-ignore-placement': false,
    'icon-padding': 0,
    'icon-anchor': 'bottom',
  },
  paint: {
    'icon-opacity': ['case',
      ['==', ['feature-state', 'selected'], true], 0,
      ['==', ['feature-state', 'hovered'], true], 0,
      1,
    ],
  },
});



export const getFilteredPoisLabelStyle = () => ({
  type: 'symbol',
  layout: {
    'text-font': [ 'Noto Sans Bold' ],
    'text-size': 10,
    'text-field': ['get', 'name'],
    'text-allow-overlap': false,
    'text-ignore-placement': false,
    'text-optional': true,
    'text-variable-anchor': ['top', 'bottom-left', 'bottom-right'],
    'text-offset': [1.5, 0.5],
    'text-justify': 'auto',
  },
  paint: {
    'text-color': ['case', ['==', ['feature-state', 'selected'], true], '#900014', '#0c0c0e'],
    'text-halo-color': 'white',
    'text-halo-width': 1,
    'text-translate': [0, -2],
  },
});
