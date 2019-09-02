import Panel from '../../libs/panel';
import roadMapTemplate from '../../views/direction/road_map.dot';
import Device from '../../libs/device';
import RoadMapPreviewPanel from './road_map_preview';
import Telemetry from '../../libs/telemetry';
import { openShareModal } from 'src/modals/ShareModal';
import { formatDuration, formatDistance } from 'src/libs/route_utils';

export default class RoadMapPanel {
  constructor(onOpen, onClose) {
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.previewRoadMap = new RoadMapPreviewPanel(this.distance);
    this.showRoute = true;
    this.panel = new Panel(this, roadMapTemplate);
    this.routes = [];
    this.isMobile = Device.isMobile;
    this.placeholder = false;
    this.error = false;
    this.origin = null;

    listen('select_road_map', i => {
      this.toggleRoute(i);
    });
  }

  setRoad(routes, vehicle, origin) {
    if (origin) {
      this.origin = origin;
    }
    this.routes = routes.map(roadStep => {
      return roadStep;
    });
    this.vehicle = vehicle;
    this.error = false;
    this.panel.update();
  }

  showPlaceholder(vehicle) {
    this.placeholder = true;
    this.vehicle = vehicle;
    this.panel.update();
  }

  hidePlaceholder() {
    this.placeholder = false;
    this.panel.update();
  }

  showError() {
    this.error = true;
    this.panel.update();
  }

  preview() {
    this.showRoute = false;
    this.previewRoadMap.setRoad(this.routes.find(route => route.isActive));
    this.onOpen();
    this.panel.update();
    fire('show_marker_steps');
    document.querySelector('.map_bottom_button_group').classList.add('itinerary_preview--active');
  }

  closeAction() {
    this.showRoute = true;
    this.previewRoadMap.close();
    this.panel.update();
    this.onClose();
    document.querySelector('.map_bottom_button_group')
      .classList
      .remove('itinerary_preview--active');
  }

  toggleRoute(i) {
    fire('toggle_route', i);

    const activeRoute = this.routes.find(route => route.isActive);
    if (activeRoute !== null) {
      activeRoute.isActive = false;
      this.panel.removeClassName(0, `#itinerary_leg_${activeRoute.id}`, 'itinerary_leg--active');
      if (activeRoute.id !== i && !Device.isMobile()) {
        this.panel.addClassName(
          0,
          `#itinerary_leg_detail_${activeRoute.id}`,
          'itinerary_leg_detail--hidden',
        );
      }
    }

    this.routes[i].isActive = true;
    this.panel.addClassName(0, `#itinerary_leg_${i}`, 'itinerary_leg--active');
  }

  toggleDetail(i) {
    this.panel.toggleClassName(0, `#itinerary_leg_detail_${i}`, 'itinerary_leg_detail--hidden');
    this.toggleRoute(i);
  }

  duration(sec) {
    return formatDuration(sec);
  }

  distance(m) {
    return formatDistance(m);
  }

  highlightStepMarker(i) {
    fire('highlight_step', i);
  }

  unhighlightStepMarker(i) {
    fire('unhighlight_step', i);
  }

  zoomStep(step) {
    fire('zoom_step', step);
  }

  getVehicleIcon() {
    switch (this.vehicle) {
    case 'driving':
      return 'icon-drive';
    case 'walking':
      return 'icon-foot';
    case 'cycling':
      return 'icon-bike';
    default:
      return '';
    }
  }

  openShare() {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    openShareModal(window.location);
  }
}
