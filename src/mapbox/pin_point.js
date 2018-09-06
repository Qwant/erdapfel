import Geometry from './geometry'
import {Marker, LngLat} from 'mapbox-gl'

const POLYCIRCLE_POINT_COUNT = 64
export default class PinPoint {
  constructor() {
    this.isSet = false
  }

  set(rawCenter, accuracy, map) {
    if(this.isSet) {
      this.move(rawCenter, accuracy)
    } else {
      let svCircle = document.getElementById('pinPointCircle')
      this.circle = Geometry.circle(rawCenter, accuracy, map, POLYCIRCLE_POINT_COUNT)
      this.marker = new Marker({element: svCircle,offset : [0,0]})
        .setLngLat(rawCenter)
        .addTo(map)
      this.isSet = true
    }
  }

  move(rawCenter, accuracy) {
    this.marker.setLngLat(new LngLat(rawCenter[0], rawCenter[1]))
    this.circle.update(rawCenter, accuracy, POLYCIRCLE_POINT_COUNT)
  }
}
