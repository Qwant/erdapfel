export default class Geometry {
  constructor(shapeId, map) {
    this.map = map
    this.shapeId = shapeId
  }
  /**
   *
   * @param rawCenter array lat, lon
   * @param radius in km
   * @param map mapbox map instance
   * @param points polygon point count
   */
  static circle(rawCenter, radius, map, points) {
    let circlePolygon = Geometry.circlePolygon(rawCenter, radius, points)
    return Geometry.addShape(circlePolygon, map)
  }

  /**
   *
   * @param center array lat, lon
   * @param radius in km
   * @param points polygon point count
   */
  update(center, radius, points) {
    let data = Geometry.circlePolygon(center, radius, points)
    let ot = this.map.getSource(this.shapeId)._data
    ot.features[0].geometry.coordinates = [data]
    this.map.getSource(this.shapeId).setData(ot)
  }

  /* private */
  static addLayer(shapeId, map) {
    map.addLayer({
      "id": shapeId,
      "type": "fill",
      "source": shapeId,
      "layout": {},
      "paint": {
        "fill-color": "#51c5ff",
        "fill-opacity": 0.5
      }
    })
  }

  static addShape(shape, map) {
    let shapeId = Geometry.getId()
    let circle = {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [shape]
          }
        }]
      }
    }
    map.addSource(shapeId, circle)
    Geometry.addLayer(shapeId, map)
    return new Geometry(shapeId, map)
  }

  static circlePolygon(rawCenter, radius, points = 64) {
    let center = {
      latitude: rawCenter[1],
      longitude: rawCenter[0]
    }
    /* black magic from stack overflow */
    const circlePolygon = []
    let distanceX = radius / (111.320 * Math.cos(center.latitude * Math.PI / 180))
    let distanceY = radius / 110.574

    let theta, x, y;
    for(let i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI)
      x = distanceX * Math.cos(theta)
      y = distanceY * Math.sin(theta)

      circlePolygon.push([center.longitude + x, center.latitude + y])
    }
    circlePolygon.push(circlePolygon[0])
    return circlePolygon
  }

  static getId() {
    if(window.__geometryCount) {
      window.__geometryCount ++
    } else {
      window.__geometryCount = 0
    }
    return `_polygon_${window.__geometryCount}`
  }
}
