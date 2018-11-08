import Poi from "./poi";

export default class PoiStoreLoadable extends Poi {
  constructor(rawPoi) {
    super(rawPoi.id, rawPoi.name, rawPoi.type, rawPoi.latLon, rawPoi.className, rawPoi.subClassName, rawPoi.tags)
    this.bbox = rawPoi.bbox
  }
}
