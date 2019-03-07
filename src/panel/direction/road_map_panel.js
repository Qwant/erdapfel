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

    listen('select_road_map', (i) => {
      this.toggleRoute(i);
    })
  }

  setRoad(routes, vehicle) {
    this.routes = routes.map((roadStep) => {
      return roadStep
    })
    this.vehicle = vehicle
    this.panel.update()
  }

  preview() {
    this.showRoute = false
    this.previewRoadMap.setRoad(this.routes.find((route) => route.isActive))
    this.panel.update()
    fire('show_marker_steps')
    document.querySelector('.map_bottom_button_group').classList.add('itinerary_preview--active')
  }

  hideForm() {
    document.querySelectorAll('.itinerary_fields')[0].style.display = 'none';
    document.querySelectorAll('.itinerary_vehicles')[0].style.display = 'none';
  }

  toggleRoute(i) {
    fire('toggle_route', i)

    let activeRoute = this.routes.find((route) => route.isActive)
    if(activeRoute !== null){
      activeRoute.isActive = false
      this.panel.removeClassName(0, `#itinerary_leg_${activeRoute.id}`, 'itinerary_leg--active')
      if(activeRoute.id !== i && !Device.isMobile()){
        this.panel.addClassName(0, `#itinerary_leg_detail_${activeRoute.id}`, 'itinerary_leg_detail--hidden')
      }
    }

    this.routes[i].isActive = true;
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

  getVehicleIcon(){
    switch(this.vehicle){
      case 'driving':
        return 'icon-drive'
      case 'walking':
        return 'icon-foot'
      case 'cycling':
        return 'icon-bike'
      default:
        return ''
    }
  }
}
