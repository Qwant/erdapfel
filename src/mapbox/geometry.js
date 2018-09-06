export default class Geometry {
  static addLayer(map) {
    map.addLayer({
      "id": "polygons",
      "type": "fill",
      "source": "polygons",
      "layout": {},
      "paint": {
        "fill-color": "blue",
        "fill-opacity": 0.6
      }
    })
  }

  /**
   *
   * @param rawCenter array lat, lon
   * @param radius in km
   * @param map mapbox map instance
   * @param points polygon point count
   */
  static circle(rawCenter, radius, map, points = 64) {
    let center = {
      latitude: rawCenter[1],
      longitude: rawCenter[0]
    }


    const polygon = []
    let distanceX = radius / (111.320 * Math.cos(center.latitude * Math.PI / 180))
    let distanceY = radius / 110.574

    let theta, x, y;
    for(let i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI);
      x = distanceX * Math.cos(theta);
      y = distanceY * Math.sin(theta);

      polygon.push([center.longitude + x, center.latitude + y]);
    }
    polygon.push(polygon[0])
    let circle = {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [polygon]
          }
        }]
      }
    }
    map.addSource("polygons", circle)
    Geometry.addLayer(map)
    return
  }
}