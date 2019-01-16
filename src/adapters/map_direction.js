

export default class MapDirection {
  constructor(scene) {
    this.scene = scene
    listen('direction_add_layer', (options) => {
      console.log(options)
      this.scene.mb.addLayer(this.getGeoJSONPolygon(polygon, color))
    })
  }

  getGeoJSONPolygon(polygon, color) {
    return {
      "id": "route" + QwantDirection.routeset + "-" + (QwantDirection.routes++),
      "type": "line",
      "source": {
        "type": "geojson",
        "data": {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": polygon
          }
        }
      },
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": color,
        "line-width": 5
      }
    }
  }

}