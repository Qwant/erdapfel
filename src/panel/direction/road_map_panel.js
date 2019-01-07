import Panel from "../../libs/panel";
import roadMapTemplate from '../../views/direction/road_map.dot'

export default class RoadMapPanel {
  constructor() {
    this.panel = new Panel(this, roadMapTemplate)
    this.routes = []
  }

  setRoad(road) {
    this.routes = road.routes.map((roadStep) => {
      return roadStep
    })

    this.panel.update()
  }

  toggleRoute(i) {

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
        ret += hour + "h "
        min = min - 60 * hour
      }
      if((hour > 0 || min > 0) && hour < 10) {
        ret += min + "min "
      }
      if(!hour && isDisplaySeconds) {
        ret += Math.floor(sec - hour * 3600 - min * 60) + "s"
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
          ret = `${(m / 1000).toFixed(1).replace(".",",")}km`
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
}
