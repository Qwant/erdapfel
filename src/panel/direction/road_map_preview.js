import Panel from '../../libs/panel';
import roadMapTemplate from '../../views/direction/road_map_preview.dot';

export default class RoadMapPreviewPanel {
  constructor(distance) {
    this.panel = new Panel(this, roadMapTemplate);
    this.stepId = 0;
    this.routes = [];
    this.activeRoute = null;
    this.distance = distance;
  }

  setRoad(activeRoute) {
    this.activeRoute = activeRoute;
    this.stepId = 0;
    this.step = this.activeRoute.legs[0].steps[this.stepId];
    fire('zoom_step', this.step);
  }

  next() {
    this.stepId += 1;
    this.step = this.activeRoute.legs[0].steps[this.stepId];
    fire('zoom_step', this.step);
    this.panel.update();
  }

  previous() {
    this.stepId -= 1;
    this.step = this.activeRoute.legs[0].steps[this.stepId];
    fire('zoom_step', this.step);
    this.panel.update();
  }

  close() {
    this.routes = [];
    this.stepId = 0;
    this.panel.update();
  }
}