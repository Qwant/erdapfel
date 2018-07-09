/**
 * simple Poi helper
 */
import Ajax from "../libs/ajax"
import nconf from '@qwant/nconf-getter'
import PanelManager from "../proxies/panel_manager";
const serviceConfig = nconf.get().services
const LNG_INDEX = 0
const LAT_INDEX = 1

function Poi(latLon, id, name, className, subClassName, tags) {
  this.latLon = latLon
  this.name = name
  this.tags = tags
  this.className = className
  this.subClassName = subClassName
  this.id = id
}

Poi.prototype.getLngLat = function() {
  return this.latLon
}

Poi.prototype.getKey = function () {
  return `${this.latLon.lat}_${this.latLon.lng}`
}

Poi.prototype.store = function() {
  return {
    latLon : this.latLon,
    id : this.id,
    name : this.name,
    className : this.className,
    subClassName : this.subClassName,
    zoom : this.zoom,
    bbox : this.bbox,
  }
}

Poi.load = function (rawPoi) {
  let poi = new Poi(rawPoi.latLon, rawPoi.id, rawPoi.name, rawPoi.className, rawPoi.subClassName, rawPoi.tags)
  poi.bbox = rawPoi.bbox
  poi.zoom = rawPoi.zoom
  return poi
}

Poi.apiLoad = async function (id) {
  let rawPoi = null
  try {
    rawPoi = await Ajax.queryLang(`${serviceConfig.idunn.url}/v1/pois/${id}`)
  } catch (err) {
    PanelManager.closeAll()
    if(err === 404) {
      return
    }
    else {
      fire('error_h', err)
      return
    }
  }
  let latLng = {lat : rawPoi.geometry.coordinates[LAT_INDEX], lng : rawPoi.geometry.coordinates[LNG_INDEX]}
  const poi = new Poi(latLng, id, rawPoi.name, rawPoi.class_name, rawPoi.subclass_name)
  poi.blocks = rawPoi.blocks
  poi.localName = rawPoi.local_name
  poi.address = rawPoi.address
  return poi
}



export default Poi
