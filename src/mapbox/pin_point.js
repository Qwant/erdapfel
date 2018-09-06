import Geometry from './geometry'
import {Marker, LngLat} from 'mapbox-gl--ENV'
const POLYCIRCLE_POINT_COUNT = 64

export default class PinPoint {
  constructor() {
    this.isSet = false
  }

  set(rawCenter, accuracy, map) {
    if(this.isSet) {
      this.move(rawCenter, accuracy)
    } else {
      this.circle = Geometry.circle(rawCenter, accuracy, map, POLYCIRCLE_POINT_COUNT)
      this.marker = new Marker({offset : [3,3]})
        .setLngLat(rawCenter)
        .addTo(map)
      this.isSet = true
    }
  }

  move(rawCenter, accuracy) {
    this.marker.setLngLat(new LngLat(rawCenter[0], rawCenter[1]))
    this.circle.update(rawCenter, accuracy, 64)
  }
}
