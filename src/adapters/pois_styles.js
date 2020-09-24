
export const filteredPoisStyle = {
  type: 'symbol',
  layout: {
    'icon-image': 'pin_with_dot',
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
    'icon-size': 0.5,
    'icon-anchor': 'bottom',

    'text-font': [ 'Noto Sans Bold' ],
    'text-size': 10,
    'text-field': '{name}',
    'text-allow-overlap': false,
    'text-ignore-placement': false,
    'text-optional': true,
    'text-anchor': 'top',
    'text-radial-offset': 0.25,
  },
  paint: {
    'text-color': ['case', ['==', ['feature-state', 'selected'], true], '#900014', '#0c0c0e'],
    'text-halo-color': 'white',
    'text-halo-width': 1,
    'text-translate': [0, 4],
  },
};
