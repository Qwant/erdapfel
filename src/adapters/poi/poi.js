/**
 * simple Poi helper
 */
import {version} from '../../../config/constants.yml';
import ExtendedString from '../../libs/string';

const ZOOM_BY_POI_TYPES = [
  {type: 'street', zoom: 17},
  {type: 'house', zoom: 19},
  {type: 'poi', zoom: 18, panel: true},
];
const DEFAULT_ZOOM = 16;

export const POI_TYPE = 'poi';

export default class Poi {
  constructor(id, name, alternativeName, type, latLon, className, subClassName) {
    this.id = id;
    this.name = name;
    this.alternativeName = alternativeName;
    this.type = type;
    this.latLon = latLon;
    this.className = className;
    this.subClassName = subClassName;
    this.zoom = this.computeZoom();
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
    let zoomSetting = ZOOM_BY_POI_TYPES.find(zoomType =>
      this.type === zoomType.type
    );
    if (zoomSetting) {
      return zoomSetting.zoom;
    } else {
      return DEFAULT_ZOOM;
    }
  }

  poiStoreLiteral() {
    const serializeKeys = ['id', 'name', 'alternativeName', 'type', 'latLon', 'className', 'subClassName', 'zoom', 'bbox'];
    return Object.keys(this).reduce((poiLiteral, key) => {
      if (serializeKeys.includes(key)) {
        poiLiteral[key] = this[key];
      }
      return poiLiteral;
    }, {});
  }

  toUrl() {
    let slug = ExtendedString.slug(this.name);
    return `${this.id}@${slug}`;
  }

  toAbsoluteUrl() {
    let location = window.location;
    return `${location.protocol}//${location.host}${window.baseUrl}place/${this.toUrl()}/#map=${this.zoom}/${this.latLon.lat.toFixed(7)}/${this.latLon.lng.toFixed(7)}`;
  }

  static isPoiCompliantKey(k) {
    const keyPattern = new RegExp(`^qmaps_v${version}_favorite_place_.*`);
    return k.match(keyPattern) !== null;
  }
}
