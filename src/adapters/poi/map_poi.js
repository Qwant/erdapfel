import Poi,{POI_TYPE} from "./poi";

export default class MapPoi extends Poi {
  constructor(feature, lngLat) {
    let id = feature.properties.global_id
    console.log(feature)
    super(id,  feature.name,'to replace', POI_TYPE, lngLat)
  }
}
