import { LngLat } from 'maplibre-gl';
import Poi, { POI_TYPE } from './poi';

export default class MapPoi extends Poi {
  constructor(feature) {
    const {
      global_id,
      ['class']: className,
      subclass: subClassName,
      name,
      qwant_id,
    } = feature.properties;
    const ll = LngLat.convert(feature.geometry.coordinates);
    super(global_id || feature.id, qwant_id, name, POI_TYPE, ll, className, subClassName);
  }
}
