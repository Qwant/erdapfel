import Poi from "./poi";
import Ajax from "../../libs/ajax";
import nconf from '../../../local_modules/nconf_getter/index'
import Error from '../../adapters/error'

const serviceConfig = nconf.get().services
const LNG_INDEX = 0
const LAT_INDEX = 1

export default class IdunnPoi extends Poi {
  constructor(rawPoi) {
    let latLng = {lat : rawPoi.geometry.coordinates[LAT_INDEX], lng : rawPoi.geometry.coordinates[LNG_INDEX]}
    super(rawPoi.id, rawPoi.name, 'poi', latLng, rawPoi.class_name, rawPoi.subclass_name, '')
    this.blocks = rawPoi.blocks
    this.localName = rawPoi.local_name
    this.address = rawPoi.address
  }

  static async poiApiLoad(id) {
    let rawPoi = null
    let url = `${serviceConfig.idunn.url}/v1/pois/${id}`
    try {
      rawPoi = await Ajax.getLang(url)
    } catch (err) {
      if(err === 404) {
        return
      }
      else {
        Error.sendOnce('idunn_poi', 'poiApiLoad', `unknown error getting idunn poi reaching ${url}`, err)
        return
      }
    }
    return new IdunnPoi(rawPoi)
  }
}
