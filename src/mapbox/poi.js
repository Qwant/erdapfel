/**
 * simple Poi helper
 */
import Ajax from "../libs/ajax"
import nconf from '@qwant/nconf-getter'
import {version} from '../../config/constants.yml'
import ExtendedString from "../libs/string";
const serviceConfig = nconf.get().services
const ZOOM_BY_POI_TYPES = [{type : 'street', zoom : 17}, {type : 'house', zoom : 19}, {type : 'poi', zoom : 18, panel: true}]
const DEFAULT_ZOOM = 16
const LNG_INDEX = 0
const LAT_INDEX = 1

function Poi(id, name, type, latLon, className, subClassName, tags) {
  this.id = id
  this.name = name
  this.type = type
  this.latLon = latLon
  this.className = className
  this.subClassName = subClassName
  this.tags = tags
  this.computeZoom()
}

Poi.prototype.getLngLat = function() {
  return this.latLon
}

Poi.prototype.getKey = function () {
  return `qmaps_v${version}_favorite_place_${this.id}`
}

Poi.isPoiCompliantKey = function (k) {
  const keyPattern = new RegExp(`^qmaps_v${version}_favorite_place_.*`)
  return k.match(keyPattern) !== null
}

Poi.prototype.computeZoom = function() {
  let zoomSetting = ZOOM_BY_POI_TYPES.find(zoomType =>
    this.type === zoomType.type
  )
  if(zoomSetting) {
    this.zoom = zoomSetting.zoom
  } else {
    this.zoom = DEFAULT_ZOOM
  }
}

Poi.prototype.store = function() {
  return {
    latLon : this.latLon,
    id : this.id,
    name : this.name,
    className : this.className,
    subClassName : this.subClassName,
    zoom : this.zoom,
    type : 'poi',
    bbox : this.bbox,
  }
}

Poi.storeLoad = function (rawPoi) {
  let poi = new Poi(rawPoi.id, rawPoi.name, rawPoi.type, rawPoi.latLon, rawPoi.className, rawPoi.subClassName, rawPoi.tags)
  poi.bbox = rawPoi.bbox
  return poi
}

Poi.hotLoad = function () {
  if(window.hotLoadPoi) {
    return Poi.parsePoi(window.hotLoadPoi)
  }
}

Poi.poiApiLoad = async function (id) {
  let rawPoi = null
  try {
    rawPoi = await Ajax.queryLang(`${serviceConfig.idunn.url}/v1/pois/${id}`)
  } catch (err) {
    if(err === 404) {
      return
    }
    else {
      fire('error_h', err)
      return
    }
  }
  return Poi.parsePoi(rawPoi)
}

Poi.parsePoi = function(rawPoi) {
  let latLng = {lat : rawPoi.geometry.coordinates[LAT_INDEX], lng : rawPoi.geometry.coordinates[LNG_INDEX]}
  const poi = new Poi(rawPoi.id, rawPoi.name, 'poi', latLng, rawPoi.class_name, rawPoi.subclass_name)
  poi.blocks = rawPoi.blocks
  poi.localName = rawPoi.local_name
  poi.address = rawPoi.address
  return poi
}

Poi.mapLoad = function(feature, lngLat) {
  let id = feature.properties.global_id
  return new Poi(id,  feature.name, 'poi', lngLat)
}

Poi.geocoderLoad = function(feature) {
  const resultType = feature.properties.geocoding.type

  let poiClassText = ''
  let poiSubclassText = ''

  if(feature.properties.geocoding.properties && feature.properties.geocoding.properties.length > 0) {
    let poiClass = feature.properties.geocoding.properties.find((property) => {return property.key === 'poi_class'})

    if(poiClass) {
      poiClassText = poiClass.value
    }
    let poiSubclass = feature.properties.geocoding.properties.find((property) => {return property.key === 'poi_subclass'})
    if(poiSubclass) {
      poiSubclassText = poiSubclass.value
    }
  }
  let addressLabel = ''
  if(feature.properties && feature.properties.geocoding && feature.properties.geocoding.address) {
    addressLabel = feature.properties.geocoding.address.label
  }

  let name = ''
  if(addressLabel) {
    name = feature.properties.geocoding.name
  } else {
    name = feature.properties.geocoding.label
  }
  let poi = new Poi(feature.properties.geocoding.id, name, resultType, {lat : feature.geometry.coordinates[1], lng : feature.geometry.coordinates[0]}, poiClassText, poiSubclassText)
  poi.value = feature.properties.geocoding.label
  poi.addressLabel = addressLabel
  if(feature.properties.geocoding.bbox) {
    poi.bbox = feature.properties.geocoding.bbox
  }
  return poi
}

Poi.prototype.toUrl = function () {
  let slug = ExtendedString.slug(this.name)
  return `${this.id}@${slug}`
}

Poi.prototype.toAbsoluteUrl = function () {
  let location = window.location
  return `${location.protocol}//${location.host}${baseUrl}place/${this.toUrl()}/#map=${this.zoom}/${this.latLon.lat.toFixed(7)}/${this.latLon.lng.toFixed(7)}`
}

window.Poi = Poi
export default Poi
