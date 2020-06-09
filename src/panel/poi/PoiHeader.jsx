/* global _ */
import React from 'react';
import ReviewScore from 'src/components/ReviewScore';
import PoiTitle from 'src/components/PoiTitle';

const PoiHeader = ({ poi }) => {
  const { name, localName, subClassName, blocksByType, address } = poi;
  const title = name || localName;

  if (subClassName === 'latlon') {
    return <div>
      {address && address.label &&
        <div className="poi_panel__pre_title">{ _('Close to', 'poi')}</div>
      }
      <h4 className="poiTitle">
        <span className="u-text--smallTitle">
          {address && address.label ? address.label : title}
        </span>
      </h4>
      {address && address.label && <p className="poi_panel__address">{title}</p>}
    </div>;
  }

  const grades = blocksByType && blocksByType.grades;
  return <div>
    <PoiTitle poi={poi} withAlternativeName />
    {address && address.label && <p className="poi_panel__address">{address.label}</p>}
    {grades && <ReviewScore reviews={grades} poi={poi} />}
  </div>;
};

export default PoiHeader;
