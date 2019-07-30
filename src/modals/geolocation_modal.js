import geolocModalPendingView from '../views/geolocation_pending_modal.dot';
import geolocModalDeniedView from '../views/geolocation_denied_modal.dot';
import geolocModalNotActivatedView from '../views/geolocation_not_activated_modal.dot';
import Modal from './modal';

export default class GeolocationModal {
  constructor() {
    this.modal = new Modal(this, geolocModalPendingView);
    this.onClose = null;

    listen('open_geolocate_denied_modal', () => {
      this.modal.setView(geolocModalDeniedView);
      this.modal.open();
    });

    listen('open_geolocate_not_activated_modal', () => {
      this.modal.setView(geolocModalNotActivatedView);
      this.modal.open();
    });
  }

  async openAndWaitForClose() {
    this.modal.setView(geolocModalPendingView);
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
