import Autocomplete from '../vendors/autocomplete'
let geocoderConfig = require("../../config/geocoder.yml")
import ajax from '../libs/ajax'
import Poi from '../mapbox/poi'
import IconManager from '../adapters/icon_manager'
import State from '../main'

import Store from '../adapters/store'
const store = new Store()

function SearchInput(tagSelector) {
  this.pois = []
  this.poi = null
  listen('submit_autocomplete', () => {
    let poi = this.pois[0]
    if(this.poi) {
      this.poi = poi
    }
    select(poi)
  })

  new Autocomplete({
    selector : tagSelector,
    minChars : 1,
    cachePrefix : false,
    delay : 100,
    width:'650px',
    onUpdate : (e, poi) => {
      this.poi = poi
    },
    source : (term, suggest) => {
      let center = window.map.center().toArray()
      let bbox = window.map.bbox().toArray()
      const suggestPromise = ajax.query(geocoderConfig.url, {q: term, center : center, bbox : bbox})
      const suggestHistoryPromise = store.getPrefixes(term)
      Promise.all([suggestPromise, suggestHistoryPromise]).then((responses) => {
        this.pois = buildPoi(responses[0])
        let historySuggestData = responses[1]
        historySuggestData = historySuggestData.map((historySuggest) => {
          let poi = Poi.load(historySuggest)
          poi.fromHistory = true
          return poi
        })
        this.pois = this.pois.concat(historySuggestData)
        suggest(this.pois, term)
      })
    },
    renderItem : ({id, name, fromHistory, className, subClassName, addressLabel}) => {
      let icon = IconManager.get({className : className, subClassName : subClassName})
      return `
<div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${name}">
  <div style="color:${icon ? icon.color : ''}" class="autocomplete-icon ${icon ? `icon icon-${icon.iconClass}` : 'icon-location'}"></div>
  ${name}
  ${addressLabel ? `<span class="autocomplete_address">${addressLabel}</span>` : ''}
</div>
`
    },
    onSelect : (e, term, item) => {
      e.preventDefault()
      const itemId = item.getAttribute('data-id')
      let poi = this.pois.find(poi => poi.id === itemId)
      select(poi)
    }
  })
}

function select(poi) {
  if(poi) {
    if(poi.bbox) {
      poi.padding = {top: 10,bottom: 25,left: 15,right: 5}
      fire('fit_bounds', poi);
    } else {
      fire('fly_to', poi)
    }
    fire('map_mark_poi', poi)
    State.app.poiPanel.close()
  }
}

function buildPoi(response) {
  return response.features.map((feature) => {
    let zoomLevel = 0

    const resultType = feature.properties.geocoding.type

    let poiClassText = ''
    let poiSubclassText = ''

    if(feature.properties.geocoding.properties && feature.properties.geocoding.properties.length > 0) {
      let poiClass = feature.properties.geocoding.properties.find((property) => {return property.key === 'poi_class'})

      if(poiClass) {
        poiClassText = poiClass.value
      }
      let poiSubclass = feature.properties.geocoding.properties.find((property) => {return property.key === 'poi_subclass'})
      if(poiSubclass) {
        poiSubclassText = poiSubclass.value
      }
    }
    let addressLabel = ''
    if(feature.properties && feature.properties.geocoding && feature.properties.geocoding.address) {
      addressLabel = feature.properties.geocoding.address.label
    }

    let name = ''
    if(addressLabel) {
      name = feature.properties.geocoding.name
    } else {
      name = feature.properties.geocoding.label
    }
    let poi = new Poi({lat : feature.geometry.coordinates[1], lng : feature.geometry.coordinates[0]}, feature.properties.geocoding.id, name, poiClassText, poiSubclassText)
    poi.value = feature.properties.geocoding.label
    poi.addressLabel = addressLabel
    poi.poi_type = resultType
    poi.zoom = zoomLevel
    poi.bbox = feature['bbox']
    return poi
  })
}

export default SearchInput
