import Autocomplete from '../vendors/autocomplete'
import ajax from '../libs/ajax'

function SearchInput(tagSelector, scene) {
  this.items = []
   new Autocomplete({
    selector : tagSelector,
    minChars : 1,
     cachePrefix : false,
    delay : 0,
    source : (term, suggest) => {
      const suggestPromise = ajax.query('https://search.mapzen.com/v1/search', {text: term, api_key: '***REMOVED***'})
      suggestPromise.then((data) => {
        this.items = extractMapzenData(data)
        suggest(this.items)
      }).catch(() => {
        console.error('error while suggest')
      })
    },
    renderItem : (item, search) => {
      return `
        <div class="autocomplete-suggestion autocomplete_suggestion" data-id="${item.id}" data-val="${item.value}">
          ${item.value}
        </div>
      `
    },
    onSelect : (e, term, item) => {
      const itemId = item.getAttribute('data-id')
      this.items.forEach((item) => {
        if(item.id === itemId) {
          if(item.bbox) {
            scene.fitBounds(item.bbox, {
              padding: {
                top: 10,
                bottom: 25,
                left: 15,
                right: 5
              }
            });
          } else {
            scene.flyTo([item.lat, item.lon], item.zoom_level)
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
