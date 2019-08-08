import { LngLat } from 'mapbox-gl--ENV';
import Poi, { POI_TYPE } from './poi';

export default class MapPoi extends Poi {
  constructor(feature) {
    const id = feature.properties.global_id;
    const [ lng, lat ] = feature.geometry.coordinates;
    super(id, feature.name, null, POI_TYPE, new LngLat(lng, lat));
  }
}
