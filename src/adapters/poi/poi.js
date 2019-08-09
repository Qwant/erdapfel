/**
 * simple Poi helper
 */
import { version } from 'config/constants.yml';
import ExtendedString from '../../libs/string';

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

  getLngLat() {
    return this.latLon;
  }

  getInputValue() {
    return this.name;
  }

  getKey() {
    return `qmaps_v${version}_favorite_place_${this.id}`;
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

  poiStoreLiteral() {
    const serializeKeys = ['id', 'name', 'alternativeName', 'type', 'latLon', 'className',
      'subClassName', 'zoom', 'bbox'];
    return Object.keys(this).reduce((poiLiteral, key) => {
      if (serializeKeys.includes(key)) {
        poiLiteral[key] = this[key];
      }
      return poiLiteral;
    }, {});
  }

  toUrl() {
    const slug = ExtendedString.slug(this.name);
    return `${this.id}@${slug}`;
  }

  toAbsoluteUrl() {
    const location = window.location;
    const protocol = location.protocol;
    const host = location.host;
    const baseUrl = window.baseUrl;
    const lat = this.latLon.lat.toFixed(7);
    const lon = this.latLon.lng.toFixed(7);
    return `${protocol}//${host}${baseUrl}place/${this.toUrl()}/#map=${this.zoom}/${lat}/${lon}`;
  }

  static isPoiCompliantKey(k) {
    const keyPattern = new RegExp(`^qmaps_v${version}_favorite_place_.*`);
    return k.match(keyPattern) !== null;
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

// Helper used by tests.
window.Poi = Poi;
