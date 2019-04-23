import Poi from "./poi";
import ExtendedString from "../../libs/string";
import IdunnPoi from "./idunn_poi";

const LAT_POSITION = 1
const LON_POSITION = 2
const LABEL_POSITION  = 4
const DIRECTION_URL_REGEX = /^latlon:(-?\d*\.\d*):(-?\d*\.\d*)(@(.*))?/

export default class LatLonPoi extends Poi {
  constructor(latLon, label) {
    let id = `latlon:${latLon.lat.toFixed(5)}:${latLon.lng.toFixed(5)}`

    if(!label) {
      label = `${latLon.lat.toFixed(5)} : ${latLon.lng.toFixed(5)}`
    }
    super(id, label, null, null, latLon)
  }

  toUrl() {
    return this.id
  }

  static async fromUrl(urlParam) {
    if(!urlParam) {
      return Promise.reject()
    }

    if(urlParam.match(/^latlon:/)) {
      let urlData = urlParam.match(DIRECTION_URL_REGEX)
      let lat = urlData[LAT_POSITION]
      let lng = urlData[LON_POSITION]

      if(lat && lng) {
        let latLng = {lat : parseFloat(lat), lng : parseFloat(lng)}
        if(urlData[LABEL_POSITION]) {
          return Promise.resolve(new LatLonPoi(latLng, ExtendedString.htmlEncode(urlData[LABEL_POSITION])))
        } else {
          return Promise.resolve(new LatLonPoi(latLng))
        }
      }
    } else {
      let urlData = urlParam.match(/^(.*?)(@(.*))?$/)
      let idunnId = urlData[1]
      return IdunnPoi.poiApiLoad(idunnId)
    }
  }
}
