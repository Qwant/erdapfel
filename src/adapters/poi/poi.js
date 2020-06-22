/**
 * simple Poi helper
 */

export const POI_TYPE = 'poi';

export default class Poi {
  constructor(id, name, type, latLon, className, subClassName, bbox) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.latLon = latLon;
    this.className = className;
    this.subClassName = subClassName;
    this.bbox = bbox;
  }

  static deserialize(raw) {
    const { id, name, type, latLon, className, subClassName, bbox } = raw;
    return new Poi(id, name, type, latLon, className, subClassName, bbox);
  }
}
