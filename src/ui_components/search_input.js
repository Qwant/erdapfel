import Suggest from "../adapters/suggest";
import PanelManager from "../proxies/panel_manager";

const MAPBOX_RESERVED_KEYS = [
    37 // ←
  , 38 // ↑
  , 39 // →
  , 40 // ↓
  , 107 // -
  , 109 // +
]

export default class SearchInput {

  /* Singleton */
  static initSearchInput(tagSelector) {
    if(window.__searchInput) {
      return window.__searchInput
    } else {
      window.__searchInput = new SearchInput(tagSelector)
    }
  }

  static minify() {
    document.querySelector('.top_bar').classList.add('top_bar--small')
    window.__searchInput.isEnabled = false
  }

  static unMinify() {
    document.querySelector('.top_bar').classList.remove('top_bar--small')
    window.__searchInput.isEnabled = true
  }

  constructor(tagSelector) {
    this.handleKeyboard()
    this.suggest = new Suggest(tagSelector, (selectedPoi) => this.selectItem(selectedPoi))
    this.isEnabled = true

    listen('submit_autocomplete', async () => {
      this.suggest.onSubmit()
    })
  }

  handleKeyboard() {
    document.onkeydown = function(e) {
      if(MAPBOX_RESERVED_KEYS.find((key) => key === e.keyCode)) {console.log( e.keyCode); return}
      if(!e.shiftKey && !e.ctrlKey) {
        if(document.activeElement
          && document.activeElement.tagName !== 'INPUT'
          && window.__searchInput.isEnabled) {
          document.getElementById('search').focus()
        }
      }
    }
  }

  async selectItem (selectedPoi) {
    if(selectedPoi) {
      fire('fit_map', selectedPoi, {sidePanelOffset : selectedPoi.type === 'poi'})
      fire('map_mark_poi', selectedPoi)
      if(selectedPoi.type === 'poi') {
        PanelManager.loadPoiById(selectedPoi.id)
      } else {
        PanelManager.closeAll()
      }
    }
  }
}
