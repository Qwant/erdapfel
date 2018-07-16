import Autocomplete from '../vendors/autocomplete'
import ajax from '../libs/ajax'
import Poi from '../mapbox/poi'
import IconManager from '../adapters/icon_manager'
import nconf from '@qwant/nconf-getter'

import Store from '../adapters/store'
import PanelManager from "../proxies/panel_manager"
const serviceConfigs = nconf.get().services
const geocoderUrl = serviceConfigs.geocoder.url
const store = new Store()
const ZOOM_BY_POI_TYPES = [{type : 'street', zoom : 17}, {type : 'house', zoom : 19}, {type : 'poi', zoom : 19, panel: true}]

function SearchInput(tagSelector) {
  this.pois = []
  this.poi = null

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
      /*
        https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude/8674#8674
        this post is about correlation between gps coordinates decimal count & real precision unit
        110m = 3 decimals
       */
      const HUNDRED_METERS_PRECISION = 1000
      let bbox = toAccuracy(window.map.bbox(), HUNDRED_METERS_PRECISION)
      /* 'bbox' is currently not used by the geocoder, it' will be used for the telemetry. */
      const suggestPromise = ajax.query(geocoderUrl, {q: term, bbox : bbox})
      const suggestHistoryPromise = getHistory(term)
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

async function select(autocompleteLine) {
  if(autocompleteLine) {
    if(autocompleteLine.bbox) {
      autocompleteLine.padding = {top: 100, bottom: 10,left: 100,right: 10} /* UI offset */
      fire('fit_bounds', autocompleteLine)
    } else {
      /* adapt zoom to corresponding poi type */
      let zoomSetting = ZOOM_BY_POI_TYPES.find(zoomType =>
        autocompleteLine.poi_type === zoomType.type
      )
      if(zoomSetting) {
        autocompleteLine.zoom = zoomSetting.zoom
        /* set offset for poi witch will open panel on desktop */
        const MOBILE_BREAK_POINT = 640
        if(zoomSetting.panel && window.innerWidth > MOBILE_BREAK_POINT) {
          const DESKTOP_PANEL_WIDTH = 496
          autocompleteLine.offset = [DESKTOP_PANEL_WIDTH / 2, 0]
        }
      }
      fire('fly_to', autocompleteLine)
    }
    fire('map_mark_poi', autocompleteLine)
    if(autocompleteLine.poi_type === 'poi' && autocompleteLine.id) {
      let poi = await Poi.apiLoad(autocompleteLine.id)
      if(poi) {
        PanelManager.setPoi(poi)
      } else {
        PanelManager.closeAll()
      }
    } else {
      PanelManager.closeAll()
    }
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
    if(feature.properties.geocoding.bbox) {
      poi.bbox = feature.properties.geocoding.bbox
    }
    return poi
  })
}

function toAccuracy(bbox, accuracy) {
  const s = Math.floor(bbox.getSouth() * accuracy) / accuracy //v -> floor
  const w = Math.floor(bbox.getWest() * accuracy) /accuracy //< -> floor
  const n = Math.ceil(bbox.getNorth() * accuracy) / accuracy //^ -> ceil
  const e = Math.ceil(bbox.getEast() * accuracy) / accuracy //> ->  ceil

  return [[s,w],[n,e]]//sw / ne
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
