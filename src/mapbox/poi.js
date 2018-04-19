/**
 * simple Poi helper
 */

function Poi(latLon, id, title, description) {
  this.latLon = latLon
  this.title = title
  this.id = id ? id + '' : `${this.latLon.lat}_${this.latLon.lng}` // force string type or fallback to latlng key
  this.description = description

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
    title : this.title,
    description : this.description,
    zoom : this.zoom,
    bbox : this.bbox,
    tags : this.tags
  }
}

Poi.load = function (rawPoi) {
  let poi = new Poi(rawPoi.latLon, rawPoi.id, rawPoi.title, rawPoi.description)
  poi.bbox = rawPoi.bbox
  poi.zoom = rawPoi.zoom
  poi.tags = rawPoi.tags
  return poi
}

Poi.sceneLoad = function (event, zoom) {
  let feature = event.features[0]
  let name = feature.properties.name || ''
  let className = feature.properties.class || ''
  let tags = feature.properties.tags || '{}'
  let poi = new Poi({lat :feature.geometry.coordinates[1], lng : feature.geometry.coordinates[0]},feature.properties.id, name, className, tags)
  poi.zoom = zoom
  try {
    let tags = JSON.parse(event.features[0].properties.tags)
    poi.tags = []
    Object.keys(tags).forEach((tagKey) => {
      if(tagKey.indexOf('name') === -1) {
        poi.tags.push({name : tagKey, value : tags[tagKey]})
      }
    })

  } catch (e) {
    poi.tags = {}
    fire('alert', 'Tags parse error ' + e)
  }


  return poi
}


export default Poi
