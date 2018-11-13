import Autocomplete from '../vendors/autocomplete'
import IconManager from '../adapters/icon_manager'
import PanelManager from '../proxies/panel_manager'
import {layout} from '../../config/constants.yml'
import ExtendedString from "../libs/string";
import BragiPoi from "./poi/bragi_poi";
import StorePoi from "./poi/poi_store";

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
        let suggestHistoryPromise = StorePoi.get(term)
        this.suggestPromise = BragiPoi.get(term)
        Promise.all([this.suggestPromise, suggestHistoryPromise]).then((responses) => {
          this.pending = false
          this.suggestPromise = null
          this.suggestList = responses[0].concat(responses[1])
          resolve(this.suggestList)
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

    renderItem : (poi) => {
      return AutocompleteTemplate(poi)
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
      let suggestList = BragiPoi.get(term)
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

/* select sub template */
function AutocompleteTemplate(poi) {
  let content = ''
  switch(poi.type) {
    case 'poi':
      content = PoiTemplate(poi)
      break
    case 'house':
      content = HouseTemplate(poi)
      break
    case 'street':
      content = StreetTemplate(poi)
      break
    default:
      content = AdminTemplate(poi)
  }
  let {id, name, fromHistory, className, subClassName, type} = poi
  let icon = IconManager.get({className : className, subClassName : subClassName , type : type})
   return `
<div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${ExtendedString.htmlEncode(name)}">
  <div style="color:${icon ? icon.color : ''}" class="autocomplete-icon ${`icon icon-${icon.iconClass}`}"></div>
  ${content}
</div>
`
}


function PoiTemplate(poi) {
  let {name, addressLabel} = poi
  return `
  <p class="autocomplete_suggestion__first_line">${ExtendedString.htmlEncode(name)}</p>
  ${addressLabel ? `<p class="autocomplete_suggestion__second_line">${ExtendedString.htmlEncode(addressLabel)}</p>` : ''}`
}

function HouseTemplate(poi) {
  let {name, postcode, city, countryName} = poi
  let address = [postcode, city, countryName].filter((zone) => zone).join(', ')
  return `
  <p class="autocomplete_suggestion__first_line">${ExtendedString.htmlEncode(name)}</p>
  ${address ? `<p class="autocomplete_suggestion__second_line">${ExtendedString.htmlEncode(address)}</p>` : ''}
`
}


function StreetTemplate(poi) {
  let {name, postcode, city, countryName} = poi
  let address = [postcode, city, countryName].filter((zone) => zone).join(', ')
  return `
  <p class="autocomplete_suggestion__first_line">${ExtendedString.htmlEncode(name)}</p>
  ${address ? `<p class="autocomplete_suggestion__second_line">${ExtendedString.htmlEncode(address)}</p>` : ''}
`
}

function AdminTemplate(poi) {
  let {name, adminLabel} = poi
  return `
  <p class="autocomplete_suggestion__first_line">${ExtendedString.htmlEncode(name)}</p>
  ${adminLabel ? `<p class="autocomplete_suggestion__second_line">${ExtendedString.htmlEncode(adminLabel)}</p>` : ''}
`
}
export default SearchInput
