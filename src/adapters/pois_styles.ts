import { ACTION_BLUE_BASE, RED_DARKER, GREY_BLACK } from 'src/libs/colors';
import { Map } from 'mapbox-gl';

export const FILTERED_POIS_PIN_STYLES = {
  type: 'symbol',
  layout: {
    'icon-image': ['concat', 'pin-', ['get', 'iconName']],
    'icon-allow-overlap': true,
    'icon-ignore-placement': false,
    'icon-padding': 0,
    'icon-anchor': 'bottom',
  },
  paint: {
    'icon-opacity': [
      'case',
      ['==', ['feature-state', 'selected'], true],
      0,
      ['==', ['feature-state', 'hovered'], true],
      0,
      1,
    ],
  },
};

export const FILTERED_POIS_LABEL_STYLES = {
  type: 'symbol',
  layout: {
    'text-font': ['Noto Sans Bold'],
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
    'text-color': ['case', ['==', ['feature-state', 'selected'], true], RED_DARKER, GREY_BLACK],
    'text-halo-color': 'white',
    'text-halo-width': 1,
    'text-translate': [0, -2],
  },
};

type SetPaintPropertyValue<T> = T | Array<SetPaintPropertyValue<T>>;

export const setPoiHoverStyle = (map: Map, layer: string) => {
  if (!map.getPaintProperty) {
    // @MAPBOX: This method isn't implemented by the Mapbox-GL mock
    return;
  }

  const textColorProperty: SetPaintPropertyValue<string> = map.getPaintProperty(
    layer,
    'text-color'
  );

  map.setPaintProperty(
    layer,
    'text-color',
    ['case', ['to-boolean', ['feature-state', 'hover']], ACTION_BLUE_BASE, textColorProperty],
    { validate: false }
  );
};
