import { LngLat } from 'mapbox-gl--ENV';
import Poi, { POI_TYPE } from './poi';

export default class MapPoi extends Poi {
  constructor(feature) {
    const {
      global_id,
      ['class']: className,
      subclass: subClassName,
      name,
    } = feature.properties;
    const ll = LngLat.convert(feature.geometry.coordinates);
    super(global_id || feature.id, name, POI_TYPE, ll, className, subClassName);
  }
}
