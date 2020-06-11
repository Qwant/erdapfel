/* global _ */
import React from 'react';
import poiSubClass from 'src/mapbox/poi_subclass';
import { capitalizeFirst } from 'src/libs/string';

const PoiTitle = ({ poi, withAlternativeName }) => {
  const { name, localName, subClassName, address } = poi;

  if (subClassName === 'latlon') {
    const latLon = name;
    if (address?.label) {
      return <div className="poiTitle">
        <div className="u-text--subtitle u-italic u-mb-4">{ _('Close to', 'poi')}</div>
        <h2 className="poiTitle-main u-text--smallTitle u-mb-4">{address?.label}</h2>
        <div className="poiTitle-position">{latLon}</div>
      </div>;
    }

    return <div className="poiTitle">
      <h2 className="poiTitle-main poiTitle-position u-text--smallTitle">{latLon}</h2>
    </div>;
  }

  const title = name || localName;
  const alternative = (withAlternativeName && name && localName && localName !== name) && localName;
  const subclass = capitalizeFirst(poiSubClass(subClassName));

  return <div className="poiTitle">
    <h2 className="poiTitle-main u-text--smallTitle">{title || subclass}</h2>
    {alternative && <div className="poiTitle-alternative u-text--subtitle u-italic">
      {alternative}
    </div>}
    {title && <div className="poiTitle-subclass u-text--subtitle">{subclass}</div>}
  </div>;
};

export default PoiTitle;
