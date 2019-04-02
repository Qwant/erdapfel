import Panel from "../libs/panel";
import panelView from "../views/category_panel.dot"
import MinimalHourPanel from "./poi_bloc/opening_minimal";
import Ajax from "../libs/ajax";
import UrlState from "../proxies/url_state";
import {paramTypes} from "../proxies/url_shard";

export class CategoryPanel {
  constructor() {
    this.minimalHourPanel = new MinimalHourPanel()
    this.panel = new Panel(this, panelView)

    this.pois = []
    this.type = ''
    this.isOpen = false

    UrlState.registerUrlShard(this, 'places', paramTypes.RESOURCE)
  }

  store () {
    return `type=${this.type}`
  }

  restore(urlShard) {
    this.type = urlShard.match(/type=(.*)/)
    this.search()
  }

  async search() {
    let bbox = window.mapGetBounds()
    console.log(bbox)

    this.pois = await Ajax.get('https://maps.dev.qwant.ninja/maps/geocoder/places_list/', {bbox : bbox,size : '', category : 'leisure'})
    this.panel.update()
  }
}
