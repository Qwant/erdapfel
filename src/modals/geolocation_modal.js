import GeolocModalView from '../views/geolocation_modal.dot'
import Panel from "../libs/panel"

export default class GeolocationModal {
  constructor() {
    this.panel = new Panel(this, GeolocModalView)
    this.active = false

    listen('open_geolocation_modal', () => {
      this.open()
    })

    listen('open_geolocation_denied_modal', () => {
      this.close()
    })
  }

  open () {
    this.active = true
    this.panel.update()
  }

  close () {
    this.active = false
    this.panel.update()
  }
}
