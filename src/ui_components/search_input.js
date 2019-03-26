import Suggest from "../adapters/suggest";
import layouts from "../panel/layouts.js";
import UrlState from "../proxies/url_state";
import UrlShards from "../proxies/url_shards";

const MAPBOX_RESERVED_KEYS = [
    'ArrowLeft' // ←
  , 'ArrowUp' // ↑
  , 'ArrowRight' // →
  , 'ArrowDown' // ↓
  , '-' // -
  , '+' // +
  , '=' // =
]


export default class SearchInput {

  /* Singleton */
  static initSearchInput(tagSelector) {
    if(! window.__searchInput) {
      window.__searchInput = new SearchInput(tagSelector)
      window.clearSearch = () => {
        window.__searchInput.suggest.setValue('')
        setTimeout(() => {search.focus()}, 0)
      }
    }
    return window.__searchInput
  }

  static minify() {
    document.querySelector('.top_bar').classList.add('top_bar--small')
    window.__searchInput.isEnabled = false
    window.__searchInput.searchInputHandle.blur()
  }

  static unMinify() {
    document.querySelector('.top_bar').classList.remove('top_bar--small')
    window.__searchInput.isEnabled = true
  }

  constructor(tagSelector) {
    this.searchInputHandle = document.querySelector(tagSelector)
    this.handleKeyboard()
    this.suggest = new Suggest(tagSelector, (selectedPoi) => this.selectItem(selectedPoi))
    this.isEnabled = true

    UrlState.registerGet(this, 'q')
    listen('submit_autocomplete', async () => {
      this.suggest.onSubmit()
    })
  }

  handleKeyboard() {
    document.onkeydown = function(e) {
      if(MAPBOX_RESERVED_KEYS.find((key) => key === e.key)) {
        return
      }
      if(!e.shiftKey && !e.ctrlKey) {
        if(document.activeElement
          && document.activeElement.tagName !== 'INPUT'
          && window.__searchInput.isEnabled) {
          document.getElementById('search').focus()
        }
      }
    }
  }

  store() {}

  async restore(fragment) {
    let shards = UrlShards.parseUrl()
    if(shards.length === 1) {
      return await this.suggest.preselect(fragment)
    }
  }

  async selectItem (selectedPoi) {
    if(selectedPoi) {
      fire('fit_map', selectedPoi, selectedPoi.type === 'poi' ? layouts.POI : layouts.FULL)
      fire('map_mark_poi', selectedPoi)
      PanelManager.loadPoiById(selectedPoi.id)
    }
  }
}
