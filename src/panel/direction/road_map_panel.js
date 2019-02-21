import Panel from '../../libs/panel';
import roadMapTemplate from '../../views/direction/road_map.dot'
import Device from '../../libs/device'
import RoadMapPreviewPanel from './road_map_preview';

export default class RoadMapPanel {
  constructor() {
    this.previewRoadMap = new RoadMapPreviewPanel(this.hideForm, this.distance)
    this.showRoute = true
    this.panel = new Panel(this, roadMapTemplate)
    this.routes = []
    this.isMobile = Device.isMobile
    this.activeRoute = null;

    listen('select_road_map', (i) => {
      this.toggleRoute(i);
    })
  }

  setRoad(routes, vehicle) {
    this.routes = routes.map((roadStep) => {
      return roadStep
    })
    this.activeRoute = this.routes[0]
    this.vehicle = vehicle
    this.panel.update()
  }

  preview() {
    this.showRoute = false
    this.previewRoadMap.setRoad(this.routes, this.activeRoute)
    this.panel.update()
    fire('show_marker_steps')
    if(Device.isMobile()){
        document.querySelectorAll('.mapboxgl-ctrl-geolocate')[0].style.marginBottom = '38px';
    }
  }

  hideForm() {
    document.querySelectorAll('.itinerary_fields')[0].style.display = 'none';
    document.querySelectorAll('.itinerary_vehicles')[0].style.display = 'none';
  }

  toggleRoute(i) {
    fire('toggle_route', i)

    if(this.activeRoute !== null){
      this.activeRoute.isActive = false
      this.panel.removeClassName(0, `#itinerary_leg_${this.activeRoute.id}`, 'itinerary_leg--active')
      if(i !== this.activeRoute.id && !Device.isMobile()){
        this.panel.addClassName(0, `#itinerary_leg_detail_${this.activeRoute.id}`, 'itinerary_leg_detail--hidden')
      }
    }

    this.routes[i].isActive = true;
    this.activeRoute = this.routes[i];
    this.panel.addClassName(0, `#itinerary_leg_${i}`, 'itinerary_leg--active')
  }

  toggleDetail(i) {
    this.panel.toggleClassName(0, `#itinerary_leg_detail_${i}`, 'itinerary_leg_detail--hidden')
    this.toggleRoute(i);
  }

  duration (sec, isDisplaySeconds) {
    let min = Math.floor(sec / 60)
    let hour = Math.floor(min / 60)
    let ret = ''
    if(sec < 5){
      ret = '-'
    }
    else {
      if(hour){
        ret += hour + 'h '
        min = min - 60 * hour
      }
      if((hour > 0 || min > 0) && hour < 10) {
        ret += min + 'min '
      }
      if(!hour && isDisplaySeconds) {
        ret += Math.floor(sec - hour * 3600 - min * 60) + 's'
      }
    }
    return ret
  }

  distance (m){
    let ret = ''
    if(m > 5){
      if(m > 1000){
        if(m > 99000){
          ret = `${Math.round(m / 1000)}km`
        } else {
          ret = `${(m / 1000).toFixed(1).replace('.',',')}km`
        }
      }
      else {
        ret = `${m.toFixed(0)}m`
      }
    }
    return ret
  }

  close_leg() {
    this.routes = []
    this.panel.update()
  }

  highlightStepMarker(i){
    fire('highlight_step', i);
  }

  unhighlightStepMarker(i){
    fire('unhighlight_step', i);
  }

  zoomStep(step){
    fire('zoom_step', step);
  }
}
