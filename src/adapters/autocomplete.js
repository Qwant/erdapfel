import Autocomplete from '../vendors/autocomplete'
import ajax from '../libs/ajax'
import Poi from '../mapbox/poi'

import Store from '../adapters/store'
const store = new Store()

function SearchInput(tagSelector) {
  this.items = []
  this.item = null
  listen('submit_autocomplete', () => {
    let item = this.items[0]
    if(this.item) {
      item = this.item
    }

    if(item.bbox) {
      let poi = new Poi(null, item.value)
      poi.bbox = item.bbox
      poi.padding = {top: 10,bottom: 25,left: 15,right: 5}
      fire('fit_bounds', poi);
    } else {
      let poi = new Poi([item.lat, item.lon], item.value)
      poi.zoom = item.zoom_level
      fire('fly_to',poi)
      fire('mark_poi', poi)
    }
  })

  new Autocomplete({
    selector : tagSelector,
    minChars : 1,
     cachePrefix : false,
    delay : 0,
    onUpdate : (e, item) => {
      this.item = item
    },
    source : (term, suggest) => {
      const suggestPromise = ajax.query('https://search.mapzen.com/v1/search', {text: term, api_key: '***REMOVED***'})
      const suggestHistoryPromise = store.getPrefixes(term)
      Promise.all([suggestPromise, suggestHistoryPromise]).then((responses) => {
        let mapZenData = responses[0]
        this.items = extractMapzenData(mapZenData)
        let historySuggestData = responses[1]
        historySuggestData = historySuggestData.map((historySuggest,i) => {
          let poi = new Poi(historySuggest.latLon, historySuggest.description)
          poi.fromHistory = true
          poi.id = i
          poi.zoom = historySuggest.zoom
          poi.value = historySuggest.title
          return poi
        })
        this.items = this.items.concat(historySuggestData)
        suggest(this.items)
      })
    },
    renderItem : ({id, value, fromHistory}, search) => {
      let re = new RegExp(`(${search})`, 'i')
      let suggestDisplay = value.replace(re, '<span class="autocomplete_prefix">$1</span>')
      return `<div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${value}">${suggestDisplay}</div>`
    },
    onSelect : (e, term, item) => {
      const itemId = parseInt(item.getAttribute('data-id'))
      this.items.forEach((poi) => {
        if(poi.id === itemId) {
          if(poi.bbox) {
            poi.padding = {top: 10,bottom: 25,left: 15,right: 5}
            fire('fit_bounds', poi);
          } else {
            fire('fly_to',poi)
            fire('mark_poi', poi)
          }
          return
        }
      })
    }
  })
}

function extractMapzenData(response) {
  const listData = response.features.map((feature) => {
    let emojiPicto = ''
    let zoomLevel = 0

    const resultType = feature.properties.layer
    switch (resultType) {
      case 'venue':
        emojiPicto = '🚘'
        zoomLevel = 16
        break
      case 'street':
        emojiPicto = '🚘'
        zoomLevel = 15
        break
      case 'locality':
        emojiPicto = '🌆'
        zoomLevel = 12
        break
      case 'address':
        emojiPicto = '🏠'
        zoomLevel = 16
        break
      case 'localadmin':
      case 'neighbourhood':
      case 'macrocounty':
      case 'region':
      case 'macroregion':
        emojiPicto = '🌎'
        zoomLevel = 12
        break
      case 'country':
        emojiPicto = '🌎'
        zoomLevel = 6
        break
      default:
        emojiPicto = '〰'
        zoomLevel = 15
    }

    let poi = new Poi([feature['geometry']['coordinates'][0], feature['geometry']['coordinates'][1]], feature['properties']['label'])
    poi.id = parseInt(feature['properties']['id'])
    poi.value = feature['properties']['label']
    poi.picto = emojiPicto
    poi.poi_type = resultType
    poi.zoom_level = zoomLevel
    poi.bbox = feature['bbox']
    return poi
  })

  return listData
}

export default SearchInput
