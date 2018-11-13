import Poi from "./poi";
import ajax from "../../libs/ajax";
import nconf from '@qwant/nconf-getter'

const serviceConfigs = nconf.get().services
const geocoderUrl = serviceConfigs.geocoder.url

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
    let adminLabel = ''
    const resultType = feature.properties.geocoding.type
    switch (resultType) {
      case 'poi':
        name = feature.properties.geocoding.name
        break
      case 'house':
        name = feature.properties.geocoding.name
        break
      case 'street':
        name = feature.properties.geocoding.name
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
          adminLabel = nameFragments[1]
        } else {
          name = feature.properties.geocoding.label
        }
    }

    super(feature.properties.geocoding.id, name, resultType, {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0]
    }, poiClassText, poiSubclassText)
    /* extract custom data for autocomplete */
    this.value = feature.properties.geocoding.label
    this.addressLabel = addressLabel
    this.adminLabel = adminLabel

    this.postcode = feature.properties.geocoding.postcode
    this.city = feature.properties.geocoding.city
    /* extract country */
    let country = feature.properties.geocoding.administrative_regions.find((administrativeRegion) =>
      administrativeRegion.zone_type === 'country'
    )
    if (country) {
      this.countryName = country.name
    }

    /* extract bbox */
    if (feature.properties.geocoding.bbox) {
      this.bbox = feature.properties.geocoding.bbox
    }
  }

  static get(term) {
    let suggests
    let queryPromise = new Promise(async (resolve) => {
      suggests = await ajax.query(geocoderUrl, {q: term})
      resolve(suggests.features.map((feature) => {
        return new BragiPoi(feature)
      }))
    })
    queryPromise.abort = () => {suggests.abort()}
    return queryPromise
  }
}
