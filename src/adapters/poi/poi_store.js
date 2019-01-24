import Poi from "./poi";
import Store from '../../adapters/store'
import Error from "../error";
import Telemetry from "../../libs/telemetry";

const store = new Store()
export default class PoiStore extends Poi {
  constructor() {
    super()
  }

  static async get(term) {
    let prefixes = await store.getPrefixes(term)
    return prefixes.map((historySuggest) => {
      return Object.assign(new PoiStore(), historySuggest)
    })
  }

  static async getAll() {
    let store = new Store()
    let storedData = []
    try {
      storedData = await store.getAllPois()
    } catch(e) {
      Telemetry.add(Telemetry.FAVORITE_ERROR_LOAD_ALL)
      Error.sendOnce('poi_store', 'getAll', 'error getting pois', e)
    }
    return storedData.map((poi) => {
      return Object.assign(new PoiStore(), poi)
    })
  }
}
