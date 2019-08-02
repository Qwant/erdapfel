import { LngLat } from 'mapbox-gl--ENV';
import Poi, { POI_TYPE } from './poi';

export default class MapPoi extends Poi {
  constructor(feature) {
    const {
      global_id: id,
      ['class']: className,
      subclass: subClassName,
    } = feature.properties;
    const ll = LngLat.convert(feature.geometry.coordinates);
    super(id, feature.name, null, POI_TYPE, ll, className, subClassName);
  }
}
