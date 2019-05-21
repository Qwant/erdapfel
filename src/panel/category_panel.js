import Panel from "../libs/panel";
import CategoryPanelView from "../views/category_panel.dot"
import MinimalHourPanel from "./poi_bloc/opening_minimal";
import UrlState from "../proxies/url_state";
import {paramTypes} from "../proxies/url_shard";
import IdunnPoi from "../adapters/poi/idunn_poi";
import SearchInput from '../ui_components/search_input';
import Telemetry from '../libs/telemetry';
import layouts from "./layouts.js";
import debounce from '../libs/debounce'
const poiSubClass = require('../mapbox/poi_subclass')

export default class CategoryPanel {
  constructor() {
    this.minimalHourPanel = new MinimalHourPanel()
    this.panel = new Panel(this, CategoryPanelView)

    this.pois = []
    this.categoryName = ''
    this.active = false
    this.poiSubClass = poiSubClass
    this.PoiMarkers = []
    this.loading = false

    UrlState.registerUrlShard(this, 'places', paramTypes.RESOURCE)
    PanelManager.register(this)

    listen('map_moveend', debounce( function() {
      if(this.active) this.search()
    }, 300, this))

    listen('click_category_poi', (poi)=> {
      if (poi.meta && poi.meta.source) Telemetry.add("open", "poi", poi.meta.source)
      this.selectPoi(poi);
    });

  }

  store () {
    if(this.active && this.categoryName && this.categoryName !== '') {
      return `type=${this.categoryName}`
    }
    return ''
  }

  restore(urlShard) {
    window.execOnMapLoaded(() => {
      this.categoryName = urlShard.match(/type=(.*)/)[1]
      this.search()
      this.open()
    })
  }

  async search() {
    this.loading = true
    let bbox = window.map.bbox()
    let urlBBox = [bbox.getWest(),bbox.getSouth(),bbox.getEast(),bbox.getNorth()]
      .map((cardinal) => cardinal.toFixed(7))
      .join(',')

    this.pois = await IdunnPoi.poiCategoryLoad(urlBBox, 50, this.categoryName, this)

    this.loading = false
    this.panel.update()
    let container = document.querySelector(".category__panel__scroll");
    if(container){
        container.scrollTop = 0;
    }

    this.addCategoryMarkers();

    document.querySelector(".service_panel").classList.remove("service_panel--active")
  }

  async open (options = {}) {
    if(options.category) {
      const { name, label } = options.category
      this.categoryName = name
      SearchInput.setInputValue(label.charAt(0).toUpperCase() + label.slice(1))
    }
    this.active = true
    this.search()
    await this.panel.update()
    UrlState.pushUrl()
  }

  close (toggleMarkers = true) {
    SearchInput.unMinify()
    document.querySelector('.top_bar').classList.remove('top_bar--category-open')
    this.active = false
    this.panel.update()
    UrlState.pushUrl()
    if(toggleMarkers){
      this.removeCategoryMarkers()
    }
  }

  showPhoneNumber(options){
    var poi = options.poi
    var i = options.i
    if (poi.meta && poi.meta.source) Telemetry.add("phone", "poi", poi.meta.source)
    document.querySelector("#category__panel__phone_hidden_" + i).style.display = "none";
    document.querySelector("#category__panel__phone_revealed_" + i).style.display = "inline";
  }

  closeAction() {
    SearchInput.setInputValue('')
    PanelManager.resetLayout()
  }

  addCategoryMarkers(){
    fire("add_category_markers", this.pois);
  }

  removeCategoryMarkers(){
    fire("remove_category_markers", this.pois);
  }

  selectPoi(poi){
    fire('fit_map', poi, layouts.LIST)
    this.close(false)
    PanelManager.loadPoiById(poi.id, {isFromList : true, list: this})
    this.highlightPoiMarker(poi)
  }

  highlightPoiMarker(poi){
    let marker = document.getElementById(poi.marker_id);
    if(marker) {
      marker.classList.add("active")
    }
  }

  unhighlightPoiMarker(poi){
    let marker = document.getElementById(poi.marker_id);
    if(marker) {
      marker.classList.remove("active")
    }
  }

  zoomOnMarkers(){
    if(window.map.mb.getZoom() < 12) {
      // TODO (to discuss)
      // request geolocation
      // if ok => zoom 12 on current position
      // if ko => zoom 12 on Paris
    }
  }
}
