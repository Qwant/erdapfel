import Autocomplete from '../vendors/autocomplete'
import IconManager from '../adapters/icon_manager'
import {layout} from '../../config/constants.yml'
import ExtendedString from "../libs/string";
import BragiPoi from "./poi/bragi_poi";
import StorePoi from "./poi/poi_store";

export default class DirectionInput {
  constructor(tagSelector, select) {

    this.select = select

    this.searchInputDomHandler = document.querySelector(tagSelector)
    this.poi = null
    this.suggestPromise = null
    this.suggestList = []
    this.pending = false
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
        let promise = new Promise((resolve, reject) => {
          /* 'bbox' is currently not used by the geocoder, it' will be used for the telemetry. */
          let suggestHistoryPromise = StorePoi.get(term)
          this.suggestPromise = BragiPoi.get(term)
          Promise.all([this.suggestPromise, suggestHistoryPromise]).then((responses) => {
            if (responses[0]) {
              this.suggestPromise = null
              this.suggestList = responses[0].concat(responses[1])
              this.suggestList.push({geolocalisation : true})
              resolve(this.suggestList)
            } else {
              resolve(null)
            }
          }).catch((e) => {
            reject(e)
          })
        })
        promise.abort = () => {
          this.suggestPromise.abort()
        }
        return promise
      },

      renderItem: (poi) => {
        return this.autocompleteTemplate(poi)
      },

      onSelect: (e, term, item, items) => {
        e.preventDefault()
        const itemId = item.getAttribute('data-id')
        let poi = items.find(poi => poi.id === itemId)
        this.searchInputDomHandler.blur()
        this.select(poi)
      }
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

  setPoi(poi) {
    this.searchInputDomHandler.value = poi.first_line
  }

  /* select sub template */
  autocompleteTemplate(poi) {
    if(poi.geolocalisation) {

      const input = ''
      const gps = ''
      const divHandler = ''
      return "<div class=itinerary_suggest_your_position onclick=\"QwantDirection.chooseCurrentPosition('" + input + "','" + gps + "','" + divHandler + "')\"><div class=itinerary_suggest_your_position_icon></div>" + _('Your position') + "</div>"
    }



    let {id, name, fromHistory, className, subClassName, type, adminLabel} = poi
    let icon = IconManager.get({className: className, subClassName: subClassName, type: type})
    let iconDom = `<div style="color:${icon ? icon.color : ''}" class="autocomplete-icon ${`icon icon-${icon.iconClass}`}"></div>`



    return `
  <div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${ExtendedString.htmlEncode(name)}">
    <div class="autocomplete_suggestion__first_line__container">
  ${iconDom}
  <div class="autocomplete_suggestion__first_line">${ExtendedString.htmlEncode(name)}</div>
</div>
${adminLabel ? `<div class="autocomplete_suggestion__second_line">${ExtendedString.htmlEncode(adminLabel)}</div>` : ''}
  </div>
  `

  }
}

