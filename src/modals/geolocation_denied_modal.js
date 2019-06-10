import GeolocModalDeniedView from '../views/geolocation_denied_modal.dot';
import Modal from './modal';

export default class GeolocationDeniedModal {
  constructor() {
    this.modal = new Modal(this, GeolocModalDeniedView);

    listen('open_geolocate_denied_modal', () => {
      this.modal.open();
    });
  }

  close() {
    this.modal.close();
  }
}
