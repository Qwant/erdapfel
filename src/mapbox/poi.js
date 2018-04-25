/**
 * simple Poi helper
 */

function Poi(latLon, id, name, className, subClassName, tags) {
  this.latLon = latLon
  this.name = name
  this.tags = tags
  this.className = className
  this.subClassName = subClassName
  this.id = id ? id + '' : `${this.latLon.lat}_${this.latLon.lng}` // force string type or fallback to latlng key

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
    name : this.name,
    className : this.className,
    subClassName : this.subClassName,
    zoom : this.zoom,
    bbox : this.bbox,
    tags : this.tags
  }
}

Poi.load = function (rawPoi) {
  let poi = new Poi(rawPoi.latLon, rawPoi.id, rawPoi.name, rawPoi.className, rawPoi.subClassName, rawPoi.tags)
  poi.bbox = rawPoi.bbox
  poi.zoom = rawPoi.zoom
  return poi
}

Poi.sceneLoad = function (event, zoom) {
  let feature = event.features[0]
  let name = feature.properties.name || ''
  let className = feature.properties.class || ''
  let subClassName = feature.properties.subclass || ''
  let tags = []
  try {
    let rawTags = JSON.parse(feature.properties.tags)
    tags = []
    Object.keys(rawTags).forEach((tagKey) => {
      if(tagKey.indexOf('name') === -1) {
        tags.push({name : tagKey, value : rawTags[tagKey]})
      }
    })

  } catch (e) {
    tags = {}
    fire('alert', 'Tags parse error ' + e)
  }
  let poi = new Poi({lat :feature.geometry.coordinates[1], lng : feature.geometry.coordinates[0]},feature.properties.id, name, className, subClassName, tags)
  poi.zoom = zoom

  return poi
}


export default Poi
