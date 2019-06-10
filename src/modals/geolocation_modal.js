import GeolocModalView from '../views/geolocation_modal.dot';
import Modal from './modal';

export default class GeolocationModal {
  constructor() {
    this.modal = new Modal(this, GeolocModalView);
    this.onClose = null;
  }

  async openAndWaitForClose() {
    return new Promise(resolve => {
      this.onClose = resolve;
      this.modal.open();
    });
  }

  close() {
    this.modal.close();
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }
}
