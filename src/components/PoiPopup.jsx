import React from 'react';
import ReviewScore from 'src/components/ReviewScore';
import OpeningHour from 'src/components/OpeningHour';
import poiSubClass from '../mapbox/poi_subclass';
import nconf from '@qwant/nconf-getter';

const covid19Enabled = (nconf.get().covid19 || {}).enabled;

const PoiPopup = ({ poi }) => {
  const reviews = poi.blocksByType && poi.blocksByType.grades;
  const openingHours = poi.blocksByType && poi.blocksByType.opening_hours;
  const address = poi.address && poi.address.label;

  let displayedInfo = null;
  if (reviews) {
    displayedInfo = <ReviewScore reviews={reviews} poi={poi} />;
  } else if (openingHours && !covid19Enabled) {
    displayedInfo = <OpeningHour poi={poi} />;
  } else if (address) {
    displayedInfo = <span className="poi_popup__address">{address}</span>;
  }

  return <div className="poi_popup">
    <h1 className="poi_popup__title">{poi.name}</h1>
    <h3 className="poi_popup__category">{poiSubClass(poi.subClassName)}</h3>
    <div>{displayedInfo}</div>
  </div>;
};

export default PoiPopup;
