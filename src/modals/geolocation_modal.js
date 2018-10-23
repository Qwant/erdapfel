import GeolocModalView from '../views/geolocation_modal.dot'
import Modal from "./modal"

export default class GeolocationModal {
  constructor() {
    this.modal = new Modal(this, GeolocModalView)

    listen('open_geolocation_modal', () => {
      this.modal.open()
    })

    listen('open_geolocation_denied_modal', () => {
      this.modal.close()
    })
  }

  close () {
    this.modal.close()
  }
}
