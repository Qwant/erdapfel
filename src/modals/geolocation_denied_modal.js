import GeolocModalDeniedView from '../views/geolocation_denied_modal.dot'
import Modal from "./modal"

export default class GeolocationDeniedModal {
  constructor() {
    this.modal = new Modal(this, GeolocModalDeniedView)

    listen('open_geolocation_denied_modal', () => {
      this.modal.open()
    })

    listen('open_geolocation_modal', () => {
      this.modal.close()
    })
  }

  close () {
    this.modal.close()
  }
}
