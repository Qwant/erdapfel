import Panel from "../libs/panel";
import CategoryPanelView from "../views/category_panel.dot"
import MinimalHourPanel from "./poi_bloc/opening_minimal";
import UrlState from "../proxies/url_state";
import {paramTypes} from "../proxies/url_shard";
import IdunnPoi from "../adapters/poi/idunn_poi";
import SearchInput from '../ui_components/search_input';
import layouts from "./layouts.js";
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

    UrlState.registerUrlShard(this, 'places', paramTypes.RESOURCE)
    PanelManager.register(this)

    listen('click_category_poi', (poi)=> {
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
    listen('map_loaded', () => {
      this.categoryName = urlShard.match(/type=(.*)/)[1]
      this.search()
      let bbox = window.mapGetBounds()
      this.open()
    })
  }

  async search() {
    let bbox = window.mapGetBounds()
    let urlBBox = [bbox.getWest(),bbox.getSouth(),bbox.getEast(),bbox.getNorth()]
      .map((cardinal) => cardinal.toFixed(7))
      .join(',')

    this.pois = await IdunnPoi.poiCategoryLoad(urlBBox, 50, this.categoryName)

    this.panel.update()
    let container = document.querySelector(".category__panel__scroll");
    if(container){
        container.scrollTop = 0;
    }

    this.addCategoryMarkers();

  }

  async open (options = {}) {
    SearchInput.minify()
    document.querySelector('#panels').classList.add('panels--hide-services')
    document.querySelector('#panels').classList.add('panels--category-open')
    document.querySelector('.top_bar').classList.add('top_bar--category-open')
    if(options.category) {
      this.categoryName = options.category.name
    }
    this.active = true
    this.search()
    await this.panel.update()
    UrlState.pushUrl()
  }

  close (toggleMarkers = true) {
    SearchInput.unMinify()
    document.querySelector('#panels').classList.remove('panels--hide-services')
    document.querySelector('#panels').classList.remove('panels--category-open')
    document.querySelector('.top_bar').classList.remove('top_bar--category-open')
    this.active = false
    this.panel.update()
    UrlState.pushUrl()
    console.log(toggleMarkers);
    if(toggleMarkers){
      this.removeCategoryMarkers()
    }
  }

  showPhoneNumber(options){
    var poi = options.poi
    var i = options.i
    document.querySelector("#category__panel__phone_hidden_" + i).style.display = "none";
    document.querySelector("#category__panel__phone_revealed_" + i).style.display = "inline";
  }

  closeAction() {
    PanelManager.resetLayout()
  }

  addCategoryMarkers(){
    fire("add_category_markers", this.pois);
  }

  removeCategoryMarkers(){
    fire("remove_category_markers", this.pois);
  }

  selectPoi(poi){
    // TODO telemetry
    fire('fit_map', poi, layouts.LIST)
    this.close(false)
    PanelManager.loadPoiById(poi.id, {isFromList : true})
  }

  highlightPoiMarker(poi){
    let marker = document.querySelector("#" + poi.marker_id);
    if(marker) {
      marker.classList.add("active")
    }
  }

  unhighlightPoiMarker(poi){
    let marker = document.querySelector("#" + poi.marker_id);
    if(marker) {
      marker.classList.remove("active")
    }
  }
}
