import Error from '../adapters/error';

export default class MapEasterEgg {
  static enableEggs(map) {
    this.addIcecreamLayer(map);
  }

  static addIcecreamLayer(map) {
    if (!URLSearchParams) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fraicheur') === null) {
      return;
    }
    map.removeLayer('poi-level-1');
    map.setFilter('poi-level-2', ['boolean', false]);
    map.setFilter('poi-level-3', ['boolean', false]);

    map.loadImage(`${window.baseUrl}statics/images/sorbet_64.png`, (error, image) => {
      if (error) {
        Error.sendOnce('scene', 'easter_egg', 'Failed to load image', error);
        return;
      }
      map.addImage('icecream_easter_egg', image);

      map.addLayer({
        'id': 'poi-level-1',
        'type': 'symbol',
        'source': 'poi',
        'source-layer': 'poi',
        'minzoom': 14,
        'filter': [
          'all',
          [
            '==',
            '$type',
            'Point',
          ],
          [
            'in',
            'subclass',
            'ice_cream',
          ],
        ],
        'layout': {
          'text-size': 15,
          'icon-image': 'icecream_easter_egg',
          'text-font': [
            'Noto Sans Regular',
          ],
          'text-padding': 2,
          'text-offset': [
            0,
            2.5,
          ],
          'text-anchor': 'top',
          'text-field': '{name}',
          'text-optional': true,
          'text-max-width': 12,
        },
        'paint': {
          'text-halo-blur': 0.5,
          'text-color': '#4ba2ea',
          'text-halo-width': 1,
          'text-halo-color': '#ffffff',
        },
      });
    });
  }
}
