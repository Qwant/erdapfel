import Poi from './poi';

export default class BragiPoi extends Poi {
  constructor(feature, queryContext) {
    const geocodingProps = feature.properties.geocoding;
    const { id, type, label, address, city, administrative_regions } = geocodingProps;

    let poiClassText = '';
    let poiSubclassText = '';

    if (geocodingProps.properties && geocodingProps.properties.length > 0) {
      const poiClass = geocodingProps.properties.find(property => property.key === 'poi_class');
      if (poiClass) {
        poiClassText = poiClass.value;
      }
      const poiSubclass = geocodingProps.properties.find(property =>
        property.key === 'poi_subclass');
      if (poiSubclass) {
        poiSubclassText = poiSubclass.value;
      }
    }

    /* generate name corresponding to poi type */
    let name = '';
    let alternativeName = '';

    const postcode = geocodingProps.postcode && geocodingProps.postcode.split(';')[0];
    const cityObj = administrative_regions.find(region => region.zone_type === 'city');
    const country = administrative_regions.find(region => region.zone_type === 'country');
    const countryName = country && country.name;

    switch (type) {
    case 'poi':
      name = geocodingProps.name;
      alternativeName = (address && address.label)
        || (cityObj && cityObj.label)
        || [postcode, city, countryName].filter(zone => zone).join(', ');
      break;
    case 'house':
    case 'street':
      name = geocodingProps.name;
      alternativeName = [postcode, city, countryName].filter(zone => zone).join(', ');
      break;
    default: {
      /* admin */
      const splitPosition = label.indexOf(',');
      if (splitPosition === -1) {
        name = label;
      } else {
        name = label.slice(0, splitPosition);
        alternativeName = label.slice(splitPosition + 1);
      }
    }
    }

    super(id, name, alternativeName, type, {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    }, poiClassText, poiSubclassText, geocodingProps.bbox);

    this.value = label;

    this.queryContext = queryContext;
  }

  getInputValue() {
    switch (this.type) {
    case 'house':
    case 'street':
      return this.value;
    default:
      return this.name;
    }
  }
}
