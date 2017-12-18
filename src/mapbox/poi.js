/**
 * simple Poi helper
 */

function Poi(latLon, title, description) {
  this.latLon = latLon
  this.title = title
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
  let poi = new Poi(rawPoi.latLon, rawPoi.title, rawPoi.description)
  poi.bbox = rawPoi.rawPoi
  poi.zoom = rawPoi.zoom
  return poi
}

export default Poi
