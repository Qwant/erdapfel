import Autocomplete from '../vendors/autocomplete'
import ajax from '../libs/ajax'
import Poi from '../mapbox/poi'

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
    onUpdate : (e, term, item) => {
      const itemId = item.getAttribute('data-id')
      this.items.forEach((item) => {
        if (item.id === itemId) {
          this.item = item
        }
      })
    },
    source : (term, suggest) => {
      const suggestPromise = ajax.query('https://search.mapzen.com/v1/search', {text: term, api_key: '***REMOVED***'})
      suggestPromise.then((data) => {
        this.items = extractMapzenData(data)
        suggest(this.items)
      }).catch(() => {
        console.error('error while suggest')
      })
    },
    renderItem : ({id, value}) => {
      return `<div class="autocomplete-suggestion autocomplete_suggestion" data-id="${id}" data-val="${value}">${value}</div>`
    },
    onSelect : (e, term, item) => {
      const itemId = item.getAttribute('data-id')
      this.items.forEach((item) => {
        if(item.id === itemId) {
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
          return
        }
      })
    }
  })
}

function extractMapzenData(response) {
  const listData = response.features.map((feature) => {
    let emojiPicto = ''
    var zoomLevel = 0

    const resultType = feature.properties.layer
    switch (resultType) {
      case 'venue':
        emojiPicto = ''
        zoomLevel = 16
        break
      case 'street':
        emojiPicto = ''
        zoomLevel = 15
        break
      case 'locality':
        emojiPicto = ''
        zoomLevel = 12
        break
      case 'address':
        emojiPicto = ''
        zoomLevel = 16
        break
      case 'localadmin':
      case 'neighbourhood':
      case 'macrocounty':
      case 'region':
      case 'macroregion':
        emojiPicto = ''
        zoomLevel = 12
        break
      case 'country':
        emojiPicto = ''
        zoomLevel = 6
        break
      default:
        emojiPicto = ''
        zoomLevel = 15
    }

    return {
      id : feature['properties']['id'],
      picto : emojiPicto,
      value : feature['properties']['label'],
      poi_type : resultType,
      zoom_level : zoomLevel,
      bbox : feature['bbox'],
      lat : feature['geometry']['coordinates'][0],
      lon : feature['geometry']['coordinates'][1]
    }
  })

  return listData
}

export default SearchInput
