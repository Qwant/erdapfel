import { Marker } from 'mapbox-gl--ENV'
import constants from '../../config/constants.yml'
import { createIcon } from '../adapters/icon_manager'

export default class SceneCategory {
  constructor(map) {
    this.map = map
    this.markers = []

    listen('add_category_markers', (pois) => {
      this.addCategoryMarkers(pois);
    })
    listen('remove_category_markers', () => {
      this.removeCategoryMarkers()
    })
  }

  addCategoryMarkers(pois) {
    this.setOsmPoisVisibility(false)
    pois.forEach(poi => {
      const { id, className, subClassName, type, latLon } = poi
      const marker = createIcon({ className, subClassName, type }, true)
      poi.marker_id = id.replace("pj:", "marker_")
      marker.onclick = function(){
        fire('click_category_poi', poi)
      }
      marker.id = poi.marker_id
      this.markers.push(
        new Marker({ element: marker })
         .setLngLat(latLon)
           .addTo(this.map)
      )}
    )
  }

  removeCategoryMarkers() {
    this.markers.map(mark => mark.remove())
    this.setOsmPoisVisibility(true)
  }

  setOsmPoisVisibility(displayed) {
    constants.map.pois_layers.map(poi => this.map.setLayoutProperty(poi, 'visibility', displayed ? 'visible' : 'none'))
  }
}
