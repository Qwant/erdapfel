import Geometry from './geometry'
import {Marker} from 'mapbox-gl'

export default class PinPoint {
  static set(rawCenter, precision, map) {
    Geometry.circle(rawCenter, precision, map)
    new Marker({offset : [3,3]})
      .setLngLat(center)
      .addTo(map);
  }
}