import Poi from './poi';
import { normalize as normalizeAddress } from '../../libs/address';

export default class BragiPoi extends Poi {
  constructor(feature, queryContext) {
    const geocodingProps = feature.properties.geocoding;
    const { id, type, label } = geocodingProps;

    let poiClassText = '';
    let poiSubclassText = '';

    if (geocodingProps.properties && geocodingProps.properties.length > 0) {
      const poiClass = geocodingProps.properties.find(property => property.key === 'poi_class');
      if (poiClass) {
        poiClassText = poiClass.value;
      }
      const poiSubclass = geocodingProps.properties.find(
        property => property.key === 'poi_subclass'
      );
      if (poiSubclass) {
        poiSubclassText = poiSubclass.value;
      }
    }

    /* generate name corresponding to poi type */
    let name = '';

    switch (type) {
      case 'poi':
        name = geocodingProps.name;
        break;
      case 'house':
      case 'street':
        name = geocodingProps.name;
        break;
      default: {
        /* admin */
        const splitPosition = label.indexOf(',');
        if (splitPosition === -1) {
          name = label;
        } else {
          name = label.slice(0, splitPosition);
        }
      }
    }

    super(
      id,
      name,
      type,
      {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
      },
      poiClassText,
      poiSubclassText,
      geocodingProps.bbox
    );

    this.value = label;
    this.queryContext = queryContext;

    this.address = normalizeAddress('bragi', feature.properties);
  }
}
