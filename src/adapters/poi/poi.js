/**
 * simple Poi helper
 */

export const POI_TYPE = 'poi';

export default class Poi {
  constructor(id, name, alternativeName, type, latLon, className, subClassName, bbox) {
    this.id = id;
    this.name = name;
    this.alternativeName = alternativeName;
    this.type = type;
    this.latLon = latLon;
    this.className = className;
    this.subClassName = subClassName;
    this.bbox = bbox;
  }

  getInputValue() {
    return this.name;
  }

  static deserialize(raw) {
    const { id, name, alternativeName, type, latLon, className, subClassName, bbox } = raw;
    return new Poi(id, name, alternativeName, type, latLon, className, subClassName, bbox);
  }

  serialize() {
    // In some cases the object has an `event` prop which is a low-level browser object
    // that can't be serialized in the history state => just ignore it
    const { event: _event, ...otherFields } = this;
    return otherFields;
  }
}
