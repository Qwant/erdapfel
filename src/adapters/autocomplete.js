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
      let poi = new Poi(null, item.value, item.id)
      poi.bbox = item.bbox
      poi.padding = {top: 10,bottom: 25,left: 15,right: 5}
      fire('fit_bounds', poi);
    } else {
      let poi = new Poi({lat : item.lat, lng : item.lon}, item.id, item.value)
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
        this.items = extractMapzenData(responses[0])
        let historySuggestData = responses[1]
        historySuggestData = historySuggestData.map((historySuggest) => {
          let poi = Poi.load(historySuggest)
          poi.fromHistory = true
          return poi
        })
        this.items = this.items.concat(historySuggestData)
        suggest(this.items)
      })
    },
    renderItem : ({id, title, fromHistory}, search) => {
      let re = new RegExp(`(${search})`, 'i')
      let suggestDisplay = title.replace(re, '<span class="autocomplete_prefix">$1</span>')
      return `<div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${title}">${suggestDisplay}</div>`
    },
    onSelect : (e, term, item) => {
      const itemId = item.getAttribute('data-id')
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
    let poi = new Poi({lat : feature['geometry']['coordinates'][1], lng : feature['geometry']['coordinates'][0]}, feature['properties']['id'], feature['properties']['label'])

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
