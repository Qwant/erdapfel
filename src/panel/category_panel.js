import Panel from "../libs/panel";
import panelView from "../views/category_panel.dot"
import MinimalHourPanel from "./poi_bloc/opening_minimal";
import UrlState from "../proxies/url_state";
import {paramTypes} from "../proxies/url_shard";
import IdunnPoi from "../adapters/poi/idunn_poi";
const poiSubClass = require('../mapbox/poi_subclass')

export class CategoryPanel {
  constructor() {
    this.minimalHourPanel = new MinimalHourPanel()
    this.panel = new Panel(this, panelView)

    this.pois = []
    this.categoryName = ''
    this.isOpen = false
    this.poiSubClass = poiSubClass
    UrlState.registerUrlShard(this, 'places', paramTypes.RESOURCE)
  }

  store () {
    return `type=${this.categoryName}`
  }

  restore(urlShard) {
    listen('map_loaded', () => {
      this.categoryName = urlShard.match(/type=(.*)/)
      this.search()
      let bbox = window.mapGetBounds()
      console.log(bbox)
    })
  }

  async search() {
    let bbox = window.mapGetBounds()
    let urlBBox = [bbox.getWest(),bbox.getSouth(),bbox.getEast(),bbox.getNorth()]
      .map((cardinal) => cardinal.toFixed(7))
      .join(',')

    /* to remove */ this.categoryName = 'leisure'

    this.pois = await IdunnPoi.poiCategoryLoad(urlBBox, 50, this.categoryName)

    //this.pois = await Ajax.get('https://maps.dev.qwant.ninja/maps/geocoder/places_list/', {bbox : bbox,size : '', category : 'leisure'})
    this.panel.update()
  }
}
