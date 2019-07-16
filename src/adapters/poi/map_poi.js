import Poi, {POI_TYPE} from './poi';

export default class MapPoi extends Poi {
  constructor(feature, lngLat) {
    const id = feature.properties.global_id;
    super(id, feature.name, null, POI_TYPE, lngLat);
  }
}
