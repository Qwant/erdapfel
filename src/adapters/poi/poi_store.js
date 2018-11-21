import Poi from "./poi";
import Store from '../../adapters/store'

const store = new Store()
export default class PoiStore extends Poi {
  constructor(rawPoi) {
    super(rawPoi.id, rawPoi.name, rawPoi.type, rawPoi.latLon, rawPoi.className, rawPoi.subClassName, rawPoi.tags)
    this.bbox = rawPoi.bbox
  }

  static async get(term) {
    let prefixes = await store.getPrefixes(term)
    return prefixes.map((historySuggest) => {
      let poi = new PoiStore(historySuggest)
      poi.fromHistory = true
      return poi
    })
  }
}
