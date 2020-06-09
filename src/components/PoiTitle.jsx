import React from 'react';
import poiSubClass from 'src/mapbox/poi_subclass';
import { capitalizeFirst } from 'src/libs/string';

const PoiTitle = ({ poi, withAlternativeName }) => {
  const { name, localName, subClassName } = poi;
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
