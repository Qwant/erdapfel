import GeolocModalNotActivatedView from '../views/geolocation_not_activated_modal.dot';
import Modal from './modal';

export default class GeolocationNotActivatedModal {
  constructor() {
    this.modal = new Modal(this, GeolocModalNotActivatedView);

    listen('open_geolocate_not_activated_modal', () => {
      this.modal.open();
    });
  }

  close() {
    this.modal.close();
  }
}
