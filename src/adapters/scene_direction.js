import {Map, Marker, LngLat, setRTLTextPlugin} from 'mapbox-gl--ENV'
const MAIN_ROUTE_COLOR = '#c8cbd3'
const ALTERNATE_ROUTE_COLOR = '#4ba2ea'


export default class SceneDirection {
  constructor(map) {
    this.map = map
    this.routeSetCounter = 0
    this.routeCounter = 0

    listen('add_route', ({routes, vehicle, start, end}) => {


      if(routes && routes.length > 0){

        routes.forEach((route) => {
          this.showPolygon(polyline_decode(route.geometry), MAIN_ROUTE_COLOR, false)
        })

        this.showPolygon(polyline_decode(routes[0].geometry), ALTERNATE_ROUTE_COLOR, true)

        // Custom markers
        const markerStart = document.createElement('div')
        markerStart.className = vehicle === "walking" ? 'itinerary_marker_start_walking' : 'itinerary_marker_start'

        this.markerStart = new Marker(markerStart)
          .setLngLat([start.latLon.lng, start.latLon.lat])
          .addTo(this.map)

        const markerEnd = document.createElement('div')
        markerEnd.className = 'itinerary_marker_end'


        this.markerEnd = new Marker(markerEnd)
          .setLngLat([end.latLon.lng, end.latLon.lat])
          .addTo(this.map)
      }
    })
  }

  showPolygon(polygon, color) {

    const geojson = {
      "id": `route_${this.routeSetCounter}_${this.routeCounter++}`,
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
    };

    this.map.addLayer(geojson);
  }
}

const polyline_decode = function(str, precision){
  var index = 0,
    lat = 0,
    lng = 0,
    coordinates = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, precision || 5);
  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    shift = result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += latitude_change;
    lng += longitude_change;
    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
}