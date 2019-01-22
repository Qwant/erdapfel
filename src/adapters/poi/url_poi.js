import Poi from "./poi";
import ExtendedString from "../../libs/string";
import IdunnPoi from "./idunn_poi";

const LAT_POSITION = 1
const LON_POSITION = 2
const LABEL_POSITION  = 4
const POI_ID_POSITION  = 1

export default class UrlPoi extends Poi {
  constructor(latLon, label) {
    if(!label) {
      label = `${latLon.lat.toFixed(5)} : ${latLon.lng.toFixed(5)}`

    }
    super(null, label, null, null, latLon)
  }

  static async fromUrl(urlParam) {
    if(!urlParam) {
      return Promise.reject()
    }
    if(urlParam.match(/^latlon:/)) {
      let urlData = urlParam.match(/^latlon:(-?\d*\.\d*):(-?\d*\.\d*)(@(.*))?/)
      let lat = urlData[LAT_POSITION]
      let lng = urlData[LON_POSITION]

      if(lat && lng) {
        let latLng = {lat : parseFloat(lat), lng : parseFloat(lng)}

        if(urlData[LABEL_POSITION]) {
          return Promise.resolve(new UrlPoi(latLng, ExtendedString.htmlEncode(urlData[LABEL_POSITION])))
        } else {
          return Promise.resolve(new UrlPoi(latLng))
        }
      }
    } else if(urlParam.match(/^id:/)) {
      let urlData = urlParam.match(/^latlon:(.*?)(@(.*))?$/)
      let idunnId = urlData[POI_ID_POSITION]
      return IdunnPoi.poiApiLoad(idunnId)
    }
  }
}
