/* global _ */
import React from 'react';
import poiSubClass from 'src/mapbox/poi_subclass';
import { capitalizeFirst } from 'src/libs/string';
import { filter } from 'src/libs/address';

const PoiTitle = ({ poi, withAlternativeName }) => {
  const { name, localName, subClassName, address } = poi;

  // LatLon PoI
  if (subClassName === 'latlon') {
    const latLon = name;

    // Close to (address) + GPS coordinates
    if (address) {
      return <div className="poiTitle">
        <div className="u-text--subtitle u-italic u-mb-4">{ _('Close to', 'poi')}</div>
        <h2 className="poiTitle-main u-text--smallTitle u-mb-4">{
          filter(address).map((item, index) => <div key={index}>{item}</div>)
        }</h2>
        <div className="poiTitle-position">{latLon}</div>
      </div>;
    }

    // GPS coordinates only
    return <div className="poiTitle">
      <h2 className="poiTitle-main u-text--smallTitle u-mb-4">
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
    <h2 className="poiTitle-main u-text--smallTitle">{title || subclass}</h2>
    {alternative && <div className="poiTitle-alternative u-text--subtitle u-italic">
      { filter(address).map((item, index) => <div key={index}>{item}</div>) }
    </div>}
    {title && <div className="poiTitle-subclass u-text--subtitle">{subclass}</div>}
  </div>;
};

export default PoiTitle;
