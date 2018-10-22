import GeolocModalDeniedView from '../views/geolocation_denied_modal.dot'
import Panel from "../libs/panel"

export default class GeolocationDeniedModal {
  constructor() {
    this.panel = new Panel(this, GeolocModalDeniedView)
    this.active = false

    listen('open_geolocation_denied_modal', () => {
      this.open()
    })

    listen('open_geolocation_modal', () => {
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
