import Poi from "./poi";
import ajax from "../../libs/ajax";
import nconf from '@qwant/nconf-getter'

const serviceConfigs = nconf.get().services
const geocoderUrl = serviceConfigs.geocoder.url
if(!window.__bragiCache) {
  window.__bragiCache = {}
}
export default class BragiPoi extends Poi {
  constructor(feature) {

    let poiClassText = ''
    let poiSubclassText = ''

    if (feature.properties.geocoding.properties && feature.properties.geocoding.properties.length > 0) {
      let poiClass = feature.properties.geocoding.properties.find((property) => {
        return property.key === 'poi_class'
      })

      if (poiClass) {
        poiClassText = poiClass.value
      }
      let poiSubclass = feature.properties.geocoding.properties.find((property) => {
        return property.key === 'poi_subclass'
      })
      if (poiSubclass) {
        poiSubclassText = poiSubclass.value
      }
    }
    let addressLabel = ''
    if (feature.properties && feature.properties.geocoding && feature.properties.geocoding.address) {
      addressLabel = feature.properties.geocoding.address.label
    }

    /* generate name corresponding to poi type */
    let name = ''
    let alternativeName = ''
    let adminLabel = ''
    const resultType = feature.properties.geocoding.type

    let postcode
    if(feature.properties.geocoding.postcode) {
      postcode = feature.properties.geocoding.postcode.split(';')[0]
    }
    let city = feature.properties.geocoding.city
    let country = feature.properties.geocoding.administrative_regions.find((administrativeRegion) =>
      administrativeRegion.zone_type === 'country'
    )
    let countryName
    if (country) {
      countryName = country.name
    }

    switch (resultType) {
      case 'poi':
        name = feature.properties.geocoding.name
        alternativeName = addressLabel
        break
      case 'house':
        name = feature.properties.geocoding.name

        alternativeName = [postcode, city, countryName].filter((zone) => zone).join(', ')

        break
      case 'street':
        name = feature.properties.geocoding.name
        alternativeName = [postcode, city, countryName].filter((zone) => zone).join(', ')

        break
      default: /* admin */
        let splitPosition = feature.properties.geocoding.label.indexOf(',')
        let nameFragments
        if (splitPosition === -1) {
          nameFragments = [feature.properties.geocoding.label]
        } else {
          nameFragments = [feature.properties.geocoding.label.slice(0, splitPosition), feature.properties.geocoding.label.slice(splitPosition + 1)]
        }
        if (nameFragments.length > 1) {
          name = nameFragments[0]
          alternativeName = nameFragments[1]
        } else {
          name = feature.properties.geocoding.label
          alternativeName = ''
        }
    }

    super(feature.properties.geocoding.id, name, alternativeName,resultType, {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0]
    }, poiClassText, poiSubclassText)
    /* extract custom data for autocomplete */
    this.value = feature.properties.geocoding.label
    this.adminLabel = adminLabel

    this.city = feature.properties.geocoding.city
    /* extract country */

    /* extract bbox */
    if (feature.properties.geocoding.bbox) {
      this.bbox = feature.properties.geocoding.bbox
    }
  }

  static get(term) {

    let suggestsPromise
    let queryPromise = new Promise(async (resolve, reject) => {

      if(term in window.__bragiCache) {
        suggestsPromise = Promise.resolve(window.__bragiCache[term])
        suggestsPromise.abort = () => {}
      }
      suggestsPromise = ajax.get(geocoderUrl, {q: term})
      suggestsPromise.then((suggests) => {
        let bragiResponse = suggests.features.map((feature) => {
          return new BragiPoi(feature)
        })
        window.__bragiCache[term] = bragiResponse
        resolve(bragiResponse)
      }).catch((error) => {
        if(error === 0) { /* abort */
          resolve(null)
        } else {
          reject(error)
        }
      })
    })
    queryPromise.abort = () => {suggestsPromise.abort()}

    return queryPromise
  }
}
