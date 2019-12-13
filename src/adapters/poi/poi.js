/**
 * simple Poi helper
 */

const ZOOM_BY_POI_TYPES = [
  { type: 'street', zoom: 17 },
  { type: 'house', zoom: 19 },
  { type: 'poi', zoom: 18, panel: true },
];
const DEFAULT_ZOOM = 16;

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
    this.zoom = this.computeZoom();
    this.bbox = bbox;
  }

  getInputValue() {
    return this.name;
  }

  computeZoom() {
    const zoomSetting = ZOOM_BY_POI_TYPES.find(zoomType =>
      this.type === zoomType.type
    );
    if (zoomSetting) {
      return zoomSetting.zoom;
    } else {
      return DEFAULT_ZOOM;
    }
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
