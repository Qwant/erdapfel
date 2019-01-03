import Autocomplete from '../vendors/autocomplete'
import IconManager from '../adapters/icon_manager'
import PanelManager from '../proxies/panel_manager'
import {layout} from '../../config/constants.yml'
import ExtendedString from "../libs/string";
import BragiPoi from "./poi/bragi_poi";
import PoiStore from "./poi/poi_store";

function SearchInput(tagSelector) {
  this.searchInputDomHandler = document.querySelector(tagSelector)
  this.poi = null
  this.suggestPromise = null
  this.suggestList = []
  this.pending = false
  new Autocomplete({
    selector : tagSelector,
    minChars : 1,
    cachePrefix : false,
    delay : 100,
    width:'650px',
    updateData : (items) => {
      this.suggestList = items
      this.pending = false
    },
    source : (term) => {
      /*
        https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude/8674#8674
        this post is about correlation between gps coordinates decimal count & real precision unit
        110m = 3 decimals
       */
      let promise = new Promise(async (resolve, reject) => {
        /* 'bbox' is currently not used by the geocoder, it' will be used for the telemetry. */
        let suggestHistoryPromise = PoiStore.get(term)
        this.suggestPromise = BragiPoi.get(term)
        try {
        let [bragiResponse, storeResponse] = await Promise.all([this.suggestPromise, suggestHistoryPromise])
          if(bragiResponse) {
            this.suggestPromise = null
            this.suggestList = bragiResponse.concat(storeResponse)
            resolve(this.suggestList)
          } else if(storeResponse) {
            resolve(storeResponse)
          } else {
            resolve(null)
          }
        } catch(e) {
          reject(e)
        }
      })
      promise.abort = () => {
        this.suggestPromise.abort()
      }
      return promise
    },

    renderItems : (pois) => {
      let favorites = []
      let remotes = []
        pois.forEach((poi) => {
        if(poi instanceof PoiStore) {
          favorites.push(poi)
        } else {
          remotes.push(poi)
        }
      })
      let suggestDom = remotesRender(remotes)
      if(favorites.length > 0) {
        suggestDom += favoritesRender(favorites)
      }
      return suggestDom
    },

    onSelect : (e, term, item, items) => {
      e.preventDefault()
      const itemId = item.getAttribute('data-id')
      let poi = items.find(poi => poi.id === itemId)
      this.select(poi)
    },
  })

  this.searchInputDomHandler.onkeydown = (event) => {
    if(event.keyCode !== 13) { /* prevent enter key */
      this.pending = true
    }
  }

  listen('submit_autocomplete', async () => {
    if(this.pending) {
      this.searchInputDomHandler.blur()
      let term = this.searchInputDomHandler.value
      let suggestList = await BragiPoi.get(term)
      if(suggestList.length > 0) {
        let firstPoi = suggestList[0]
        this.select(firstPoi)
      }
    } else {
      if(this.suggestList && this.suggestList.length > 0
        && this.searchInputDomHandler.value && this.searchInputDomHandler.value.length > 0) {
        this.select(this.suggestList[0])
      }
    }
  })
}

SearchInput.prototype.select = async function(selectedPoi) {
  this.searchInputDomHandler.blur()
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

function remotesRender(pois) {
  return pois.map(poi => renderItem(poi)).join('')
}

function favoritesRender(pois) {
  return `<h3 class="autocomplete_suggestion__category_title">${_('FAVORITES', 'autocomplete')}</h3> ${pois.map(poi => renderItem(poi)).join('')}`
}

/* select sub template */
function renderItem(poi) {
  let {id, name, fromHistory, className, subClassName, type, alternativeName} = poi
  let icon = IconManager.get({className : className, subClassName : subClassName , type : type})
  let iconDom = `<div style="color:${icon ? icon.color : ''}" class="autocomplete-icon ${`icon icon-${icon.iconClass}`}"></div>`

   return `
<div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${ExtendedString.htmlEncode(name)}">
  <div class="autocomplete_suggestion__first_line__container">
  ${iconDom}
  <div class="autocomplete_suggestion__first_line">${ExtendedString.htmlEncode(name)}</div>
</div>
<div class="autocomplete_suggestion__second_line">${ExtendedString.htmlEncode(alternativeName ? alternativeName : '')}</div>
</div>
`
}

export default SearchInput
