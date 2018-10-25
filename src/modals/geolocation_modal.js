import GeolocModalView from '../views/geolocation_modal.dot'
import Modal from "./modal"

export default class GeolocationModal {
  constructor() {
    this.modal = new Modal(this, GeolocModalView)

    listen('open_geolocate_modal', () => {
      this.modal.open()
    })
  }

  close () {
    this.modal.close()
  }
}
