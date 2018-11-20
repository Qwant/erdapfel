import Autocomplete from '../vendors/autocomplete'
import ajax from '../libs/ajax'
import Poi from '../mapbox/poi'
import IconManager from '../adapters/icon_manager'
import nconf from '@qwant/nconf-getter'
import Store from '../adapters/store'
import PanelManager from '../proxies/panel_manager'
import {layout} from '../../config/constants.yml'
import ExtendedString from "../libs/string";

const serviceConfigs = nconf.get().services
const geocoderUrl = serviceConfigs.geocoder.url
const store = new Store()

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
    },
    source : (term) => {
      /*
        https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude/8674#8674
        this post is about correlation between gps coordinates decimal count & real precision unit
        110m = 3 decimals
       */
      let isAbort = false
      let promise = new Promise((resolve, reject) => {
        /* 'bbox' is currently not used by the geocoder, it' will be used for the telemetry. */
        this.suggestPromise = ajax.get(geocoderUrl, {q: term})
        const suggestHistoryPromise = getHistory(term)
        Promise.all([this.suggestPromise, suggestHistoryPromise]).then((responses) => {
          this.pending = false
          this.suggestPromise = null
          let suggestList = buildPoi(responses[0])
          let historySuggestData = responses[1]
          historySuggestData = historySuggestData.map((historySuggest) => {
            let poi = Poi.storeLoad(historySuggest)
            poi.fromHistory = true
            return poi
          })
          suggestList = suggestList.concat(historySuggestData)
          resolve(suggestList)
        }).catch((e) => {
          if(isAbort) {
            resolve(null)
          } else {
            reject(e)
          }
        })
      })
      promise.abort = () => {
        this.suggestPromise.abort()
        isAbort = true
      }
      return promise

    },
    renderItem : ({id, name, fromHistory, className, subClassName, addressLabel, type}) => {
      let icon = IconManager.get({className : className, subClassName : subClassName , type : type})
      return `
<div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${ExtendedString.htmlEncode(name)}">
  <div style="color:${icon ? icon.color : ''}" class="autocomplete-icon ${`icon icon-${icon.iconClass}`}"></div>
  ${ExtendedString.htmlEncode(name)}
  ${addressLabel ? `<span class="autocomplete_address">${ExtendedString.htmlEncode(addressLabel)}</span>` : ''}
</div>
`
    },
    onSelect : (e, term, item, items) => {
      e.preventDefault()
      const itemId = item.getAttribute('data-id')
      let poi = items.find(poi => poi.id === itemId)
      this.select(poi)
    },
  })

  this.searchInputDomHandler.onkeydown = () => {
    this.pending = true
  }

  listen('submit_autocomplete', async () => {
    if(this.pending) {
      this.searchInputDomHandler.blur()
      let term = this.searchInputDomHandler.value

      let rawQueryResonse = await ajax.get(geocoderUrl, {q: term})
      let suggestList = buildPoi(rawQueryResonse)

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

function buildPoi(response) {
  return response.features.map((feature) => {
    return Poi.geocoderLoad(feature)
  })
}

async function getHistory(term) {
  return new Promise((resolve) => {
    store.getPrefixes(term).then((result) => {
      resolve(result)
    }).catch(() => {
      resolve([])
    })
  })
}

export default SearchInput
