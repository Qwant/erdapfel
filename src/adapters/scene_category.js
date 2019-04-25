import {Map, Marker, LngLat, LngLatBounds} from 'mapbox-gl--ENV'
import Device from '../libs/device'
import layouts from "../panel/layouts.js";
import constants from '../../config/constants.yml'


export default class SceneCategory {
  constructor(map) {
    this.map = map
    this.markers = []

    listen('add_category_markers', (pois) => {
      console.log(pois)
      this.addCategoryMarkers(pois);
    })
    listen('remove_category_markers', () => {
      this.removeCategoryMarkers()
    })
  }

  addCategoryMarkers(pois) {
    this.setOsmPoisVisibility('none')
    pois.forEach((poi) => {
          const marker = document.createElement('div')

          marker.className = 'category_marker'
          this.markers.push(
              new Marker(marker)
                  .setLngLat(poi.latLon)
                  .addTo(this.map)
          )
        }
    )
  }

  removeCategoryMarkers() {
    this.markers.map(mark => mark.remove())
    this.setOsmPoisVisibility('visible')
  }

  setOsmPoisVisibility(visibility) {
    constants.map.pois.map(poi => this.map.setLayoutProperty(poi, 'visibility', visibility))
  }
}
