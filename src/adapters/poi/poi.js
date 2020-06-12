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

  getInputValue() {
    return this.name;
  }

  getName() {
    throw new Error('Not implemented');
  }

  getCity() {
    throw new Error('Not implemented');
  }

  getCountry() {
    throw new Error('Not implemented');
  }

  getAddress() {
    throw new Error('Not implemented');
  }

  static deserialize(raw) {
    const { id, name, type, latLon, className, subClassName, bbox } = raw;
    return new Poi(id, name, type, latLon, className, subClassName, bbox);
  }
}
