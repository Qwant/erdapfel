import Autocomplete from '../vendors/autocomplete'
import IconManager from '../adapters/icon_manager'
import {layout} from '../../config/constants.yml'
import ExtendedString from "../libs/string";
import BragiPoi from "./poi/bragi_poi";
import PoiStore from "./poi/poi_store";

export default class Suggest {
  constructor(tagSelector, onSelect, prefixes = []) {
    this.searchInputDomHandler = document.querySelector(tagSelector)
    this.poi = null
    this.bragiPromise = null
    this.historyPromise = null
    this.suggestList = []
    this.pending = false

    this.prefixes = prefixes

    this.autocomplete = new Autocomplete({
      selector: tagSelector,
      minChars: 1,
      cachePrefix: false,
      delay: 100,
      width: '650px',
      updateData: (items) => {
        this.suggestList = items
        this.pending = false
      },
      source: (term) => {
        /*
          https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude/8674#8674
          this post is about correlation between gps coordinates decimal count & real precision unit
          110m = 3 decimals
         */
        let promise = new Promise(async (resolve, reject) => {
          /* 'bbox' is currently not used by the geocoder, it' will be used for the telemetry. */
          this.historyPromise = PoiStore.get(term)

          this.bragiPromise = BragiPoi.get(term)
          try {
            let [bragiResponse, storeResponse] = await Promise.all([this.bragiPromise, this.historyPromise])
            if (bragiResponse !== null) {
              this.bragiPromise = null
              this.suggestList = bragiResponse.concat(storeResponse)
              resolve(this.suggestList)
            } else {
              resolve(null)
            }
          } catch (e) {
            reject(e)
          }
        })
        promise.abort = () => {
          this.bragiPromise.abort()
        }
        return promise
      },

      renderItems: (pois) => {
        let favorites = []
        let remotes = []
        pois.forEach((poi) => {
          if (poi instanceof PoiStore) {
            favorites.push(poi)
          } else {
            remotes.push(poi)
          }
        })
        let suggestDom = this.prefixesRender()
        suggestDom += this.remotesRender(remotes)
        if (favorites.length > 0) {
          suggestDom += this.favoritesRender(favorites)
        }
        return suggestDom
      },

      onSelect: (e, term, item, items) => {
        e.preventDefault()
        const itemId = item.getAttribute('data-id')
        let prefixPoint = this.prefixes.find((prefix) => prefix.id === itemId)
        if(prefixPoint) {
          onSelect(prefixPoint)
        } else {
          let poi = items.find(poi => poi.id === itemId)
          onSelect(poi)
        }
        this.searchInputDomHandler.blur()

      },
    })

    this.searchInputDomHandler.onkeydown = (event) => {
      if (event.keyCode !== 13) { /* prevent enter key */
        this.pending = true
      }
    }


  }

  destroy() {
    this.autocomplete.destroy()
  }

  prefixesRender() {
    return this.prefixes.map(prefix => prefix.render())
  }

  remotesRender(pois) {
    return pois.map(poi => this.renderItem(poi)).join('')
  }

  favoritesRender(pois) {
    return `<h3 class="autocomplete_suggestion__category_title">${_('FAVORITES', 'autocomplete')}</h3> ${pois.map(poi => this.renderItem(poi)).join('')}`
  }

  /* select sub template */
  renderItem(poi) {
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
}

