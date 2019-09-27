import React from 'react';
import ReviewScore from 'src/components/ReviewScore';
import poiSubClass from 'src/mapbox/poi_subclass';

const PoiHeader = ({ poi }) => {
  const { name, localName, subClassName, blocksByType, address } = poi;
  const grades = blocksByType && blocksByType.grades;
  const title = name || localName || poiSubClass(subClassName);

  return <div>
    <h4 className="poi_panel__title">
      <span className="poi_panel__title__main">{title}</span>
      {name && localName && localName !== name &&
        <p className="poi_panel__title__alternative">{localName}</p>
      }
    </h4>
    {subClassName && <p className="poi_panel__description">{poiSubClass(subClassName)}</p>}
    {address && address.label && <p className="poi_panel__address">{address.label}</p>}
    {grades && <ReviewScore reviews={grades} poi={poi} />}
  </div>;
};

export default PoiHeader;
