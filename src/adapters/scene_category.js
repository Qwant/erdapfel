import { Marker } from 'mapbox-gl--ENV'
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
      poi.marker_id = poi.id.replace("pj:", "marker_")
      marker.className = 'category_marker'
      marker.id = poi.marker_id
      this.markers.push(
        new Marker(marker)
         .setLngLat(poi.latLon)
           .addTo(this.map)
      )}
    )
  }

  removeCategoryMarkers() {
    this.markers.map(mark => mark.remove())
    this.setOsmPoisVisibility('visible')
  }

  setOsmPoisVisibility(visibility) {
    constants.map.pois_layers.map(poi => this.map.setLayoutProperty(poi, 'visibility', visibility))
  }
}
