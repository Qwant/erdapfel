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
    bbox : this.bbox
  }
}

Poi.load = function (rawPoi) {
  let poi = new Poi(rawPoi.latLon, rawPoi.id, rawPoi.title, rawPoi.description)
  poi.bbox = rawPoi.bbox
  poi.zoom = rawPoi.zoom
  return poi
}

export default Poi
