import Ajax from "../libs/ajax";
import nconf from "../../local_modules/nconf_getter";

const token = nconf.get().direction.service.token
const OVERVIEW_SETING = 'full'
const geometries = 'geojson'

export default class DirectionApi {
  static async search(start, end, vehicle, exclude = '') {
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${vehicle}/${poiToMapBoxCoordinates(start)}%3B${poiToMapBoxCoordinates(end)}.json`
    return await Ajax.get(directionsUrl, {language : getLang().locale, exclude : exclude, geometries : geometries, steps : true, access_token : token, alternatives : true, annotations: "congestion", overview : OVERVIEW_SETING})
  }
}

const poiToMapBoxCoordinates = (poi) => {
  return `${poi.latLon.lng},${poi.latLon.lat}`
}
