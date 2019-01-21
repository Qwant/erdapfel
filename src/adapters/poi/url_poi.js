import Poi from "./poi";

export default class UrlPoi extends Poi {
  constructor(latLon, label) {
    if(!label) {
      label = `${latLon.lat.toFixed(4)} : ${latLon.lng.toFixed(4)}`
    }
    super(null, label, null, null, latLon)
  }

}