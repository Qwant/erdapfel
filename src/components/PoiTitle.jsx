/* global _ */
import React from 'react';
import poiSubClass from 'src/mapbox/poi_subclass';
import { capitalizeFirst } from 'src/libs/string';
import Address from 'src/components/ui/Address';

const PoiTitle = ({ poi, withAlternativeName }) => {
  const { name, localName, subClassName, address } = poi;

  // LatLon PoI
  if (subClassName === 'latlon') {
    const latLon = name;

    // Close to (address) + GPS coordinates
    if (address) {
      return <div className="poiTitle">
        <div className="u-text--subtitle u-italic u-mb-xxs">{ _('Close to', 'poi')}</div>
        <h2 className="poiTitle-main u-text--smallTitle u-mb-xxs">
          <Address address={address} omitCountry />
        </h2>
        <div className="poiTitle-position">{latLon}</div>
      </div>;
    }

    // GPS coordinates only
    return <div className="poiTitle">
      <h2 className="poiTitle-main u-text--smallTitle u-mb-xxs">
        { _('Geographic coordinates', 'poi')}
      </h2>
      <div className="poiTitle-position">{latLon}</div>
    </div>;
  }

  const title = name || localName;
  const alternative = (withAlternativeName && name && localName && localName !== name) && localName;
  const subclass = capitalizeFirst(poiSubClass(subClassName));

  // Location / address
  return <div className="poiTitle">
    <h2 className="poiTitle-main u-text--heading6">{title || subclass}</h2>
    {alternative && <div className="poiTitle-alternative u-text--subtitle u-italic">
      {alternative}
    </div>}
  </div>;
};

export default PoiTitle;
