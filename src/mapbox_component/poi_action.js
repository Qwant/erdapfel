import mapboxgl from 'mapbox-gl'
import PopUp from './popup'

function PoiAction(scene) {

    this.scene = scene
    this.scene.on('load', () => {

      this.scene.on('mousemove', 'poi-level-3', () => {
        // Change the cursor style as a UI indicator. // TODO test css
        this.scene.getCanvas().style.cursor = 'pointer';
      })
      scene.on('mouseleave', 'poi-level-3', () =>{
        this.scene.getCanvas().style.cursor = '';
      })


      this.scene.on('click', 'poi-level-3', (e) => {
        this.showInfoBox(e)
      })
      this.scene.on('click', 'poi-level-2', (e) => {
        this.showInfoBox(e)
      })
      this.scene.on('click', 'poi-level-1', (e) => {
        this.showInfoBox(e)
      })
    })
}

PoiAction.prototype.showInfoBox = function(e) {
  // Single out the first found feature.
  if(e && e.features && e.features.length < 0) {
    return
  }

  const feature = e.features[0];

  this.scene.flyTo({
    center: feature.geometry.coordinates
  });

  if(feature.properties.class === 'fuel') {
    new mapboxgl.Popup({closeOnClick: false})
      .setLngLat(feature._geometry.coordinates)
      .setHTML(new PopUp(feature))
      .addTo(this.scene)
  }
}

export default PoiAction
