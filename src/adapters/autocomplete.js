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
  new Autocomplete({
    selector : tagSelector,
    minChars : 1,
    cachePrefix : false,
    delay : 100,
    width:'650px',
    source : (term, suggest) => {
      /*
        https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude/8674#8674
        this post is about correlation between gps coordinates decimal count & real precision unit
        110m = 3 decimals
       */
      let isAbort = false
      let promise = new Promise((resolve, reject) => {
        const HUNDRED_METERS_PRECISION = 1000
        let bbox = toAccuracy(window.map.bbox(), HUNDRED_METERS_PRECISION)
        /* 'bbox' is currently not used by the geocoder, it' will be used for the telemetry. */
        this.suggestPromise = ajax.query(geocoderUrl, {q: term, bbox : bbox})
        const suggestHistoryPromise = getHistory(term)
        Promise.all([this.suggestPromise, suggestHistoryPromise]).then((responses) => {

          this.suggestPromise = null
          let pois = buildPoi(responses[0])
          let historySuggestData = responses[1]
          historySuggestData = historySuggestData.map((historySuggest) => {
            let poi = Poi.storeLoad(historySuggest)
            poi.fromHistory = true
            return poi
          })
          pois = pois.concat(historySuggestData)
          resolve(pois)
        }).catch((e) => {
          if(isAbort) {
            resolve([])
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
    renderItem : ({id, name, fromHistory, className, subClassName, addressLabel}) => {
      let icon = IconManager.get({className : className, subClassName : subClassName})
      return `
<div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${ExtendedString.htmlEncode(name)}">
  <div style="color:${icon ? icon.color : ''}" class="autocomplete-icon ${icon ? `icon icon-${icon.iconClass}` : 'icon-location'}"></div>
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

function toAccuracy(bbox, accuracy) {
  const s = Math.floor(bbox.getSouth() * accuracy) / accuracy //v -> floor
  const w = Math.floor(bbox.getWest() * accuracy) /accuracy //< -> floor
  const n = Math.ceil(bbox.getNorth() * accuracy) / accuracy //^ -> ceil
  const e = Math.ceil(bbox.getEast() * accuracy) / accuracy //> ->  ceil

  return [[s,w],[n,e]] //sw / ne
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
