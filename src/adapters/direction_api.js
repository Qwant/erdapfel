import Ajax from "../libs/ajax";
import nconf from "../../local_modules/nconf_getter";

const token = nconf.get().direction.service.token
const OVERVIEW_SETING = 'full'
const DIRECTION_QUERY_ERROR_CODE = 422
export const queryError = 1
const directionConfig = nconf.get().direction.service
const OVERVIEW_SETTING = 'full'
const ACCEPTED_LANGUAGES = [
  "da","de","en","eo","es","fi","fr","he","id","it",
  "ko","my","nl","no","pl","pt","ro","ru","sv","tr",
  "uk","vi","zh"
]

const geometries = 'geojson'
export const vehiculeMatching = {driving : 'driving-traffic', walking : 'walking', cycling : 'cycling'}

export default class DirectionApi {
  static async search(start, end, vehicle, exclude = '') {
    const apiVehicle = vehiculeMatching[vehicle]
    let directionsUrl = directionConfig.apiBaseUrl
    let userLang = getLang()
    let language
    if (ACCEPTED_LANGUAGES.indexOf(userLang.code) !== -1){
      language = userLang.locale
    }
    else {
      language = userLang.fallback[0]
    }
    const directionsParams = {
      language : language,
      exclude : exclude,
      geometries : geometries,
      steps : true,
      alternatives : true,
      overview : OVERVIEW_SETTING,
    }

    if(directionConfig.api === 'mapbox'){
      directionsUrl = `${directionsUrl}${apiVehicle}/`
      directionsParams.access_token = directionConfig.token
    } else if (directionConfig.api === 'qwant'){
      directionsParams.type = apiVehicle
    }
    directionsUrl = `${directionsUrl}${poiToMapBoxCoordinates(start)};${poiToMapBoxCoordinates(end)}`
    let response = null
    try {
      response = await Ajax.get(directionsUrl, directionsParams)
    } catch (e) {
      if(e.status === DIRECTION_QUERY_ERROR_CODE) {
        return queryError
      }
    }
    if (directionConfig.api === 'qwant'){
      response = response.data
    }
    return response
  }
}

const poiToMapBoxCoordinates = (poi) => {
  return `${poi.latLon.lng.toFixed(7)},${poi.latLon.lat.toFixed(7)}`
}
