/* global _ */
import React from 'react';
import ReviewScore from 'src/components/ReviewScore';
import poiSubClass from 'src/mapbox/poi_subclass';

const PoiHeader = ({ poi }) => {
  const { name, localName, subClassName, blocksByType, address } = poi;
  const title = name || localName;

  if (subClassName === 'latlon') {
    return <div>
      {address && address.label &&
        <div className="poi_panel__pre_title">{ _('Close to', 'poi')}</div>
      }
      <h4 className="poi_panel__title">
        <span className="poi_panel__title__main u-text--smallTitle">
          {address && address.label ? address.label : title}
        </span>
      </h4>
      {address && address.label && <p className="poi_panel__address">{title}</p>}
    </div>;
  }

  const grades = blocksByType && blocksByType.grades;
  const subClass = poiSubClass(subClassName);
  return <div>
    <h4 className="poi_panel__title">
      {title
        ? <span className="poi_panel__title__main u-text--smallTitle">{title}</span>
        : <div className="poi_panel__title__main u-text--smallTitle u-firstCap">{subClass}</div>}
      {name && localName && localName !== name &&
        <p className="poi_panel__title__alternative">{localName}</p>}
    </h4>
    {title && <p className="poi_panel__description u-firstCap u-text--subtitle">{subClass}</p>}
    {address && address.label && <p className="poi_panel__address">{address.label}</p>}
    {grades && <ReviewScore reviews={grades} poi={poi} />}
  </div>;
};

export default PoiHeader;
