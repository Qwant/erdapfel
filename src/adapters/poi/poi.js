/**
 * simple Poi helper
 */
import {version} from '../../../config/constants.yml'
import ExtendedString from "../../libs/string";
const ZOOM_BY_POI_TYPES = [{type : 'street', zoom : 17}, {type : 'house', zoom : 19}, {type : 'poi', zoom : 18, panel: true}]
const DEFAULT_ZOOM = 16


export default class Poi {
  constructor(id, name, type, latLon, className, subClassName, tags) {
    this.id = id
    this.name = name
    this.type = type
    this.latLon = latLon
    this.className = className
    this.subClassName = subClassName
    this.tags = tags
    this.computeZoom()
  }

  getLngLat() {
    return this.latLon
  }

  getKey() {
    return `qmaps_v${version}_favorite_place_${this.id}`
  }

  computeZoom() {
    let zoomSetting = ZOOM_BY_POI_TYPES.find(zoomType =>
      this.type === zoomType.type
    )
    if (zoomSetting) {
      this.zoom = zoomSetting.zoom
    } else {
      this.zoom = DEFAULT_ZOOM
    }
  }

  poiStoreLiteral() {
    return {
      latLon: this.latLon,
      id: this.id,
      name: this.name,
      className: this.className,
      subClassName: this.subClassName,
      zoom: this.zoom,
      type: 'poi',
      bbox: this.bbox,
    }
  }

  toUrl() {
    let slug = ExtendedString.slug(this.name)
    return `${this.id}@${slug}`
  }

  toAbsoluteUrl() {
    let location = window.location
    return `${location.protocol}//${location.host}${baseUrl}place/${this.toUrl()}/#map=${this.zoom}/${this.latLon.lat.toFixed(7)}/${this.latLon.lng.toFixed(7)}`
  }

  static isPoiCompliantKey(k) {
    const keyPattern = new RegExp(`^qmaps_v${version}_favorite_place_.*`)
    return k.match(keyPattern) !== null
  }
}

window.Poi = Poi
