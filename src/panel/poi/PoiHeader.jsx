/* global _ */
import React from 'react';
import ReviewScore from 'src/components/ReviewScore';
import poiSubClass from 'src/mapbox/poi_subclass';

const PoiHeader = ({ poi }) => {
  const { name, localName, subClassName, blocksByType, address } = poi;
  const grades = blocksByType && blocksByType.grades;
  const title = name || localName || poiSubClass(subClassName);

  return <div>
    {subClassName === 'latlon' && <div>
      {address && address.label &&
        <div className="poi_panel__pre_title">{ _('Close to', 'poi')}</div>
      }
      <h4 className="poi_panel__title">
        <span className="poi_panel__title__main u-text--smallTitle">
          {address && address.label ? address.label : title}
        </span>
      </h4>
      {address && address.label &&
        <p className="poi_panel__address">{ title }</p>
      }
    </div>}

    {subClassName !== 'latlon' && <div>
      <h4 className="poi_panel__title">
        <span className="poi_panel__title__main u-text--smallTitle">{title}</span>
        {name && localName && localName !== name &&
        <p className="poi_panel__title__alternative">{localName}</p>
        }
      </h4>
      {subClassName && <p className="poi_panel__description u-firstCap u-text--subtitle">
        {poiSubClass(subClassName)}
      </p>}
      {address && address.label && <p className="poi_panel__address">{address.label}</p>}
      {grades && <ReviewScore reviews={grades} poi={poi} />}
    </div>}

  </div>;
};

export default PoiHeader;
