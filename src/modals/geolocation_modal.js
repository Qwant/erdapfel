import GeolocModalView from '../views/geolocation_modal.dot'
import Modal from "./modal"

export default class GeolocationModal {
  constructor() {
    this.modal = new Modal(this, GeolocModalView)
    this.onClose = null

    listen('open_geolocate_modal', callback => {
      this.onClose = callback
      this.modal.open()
    })
  }

  close () {
    this.modal.close()
    if (typeof this.onClose === 'function') {
      this.onClose()
    }
  }
}
