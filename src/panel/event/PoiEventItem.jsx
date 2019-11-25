import React from 'react';
import OpeningHour from 'src/components/OpeningHour';
import ReviewScore from 'src/components/ReviewScore';
import poiSubClass from 'src/mapbox/poi_subclass';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';

const PoiEventItem = ({ poi }) => {
  const reviews = poi.blocksByType.grades;
  const address = poi.address || {};

  return <div className="event__panel__item">
    <PoiTitleImage poi={poi} />

    <h3 className="event__panel__name">{poi.getInputValue()}</h3>

    {poi.subClassName && <p className="event__panel__type">{poiSubClass(poi.subClassName)}</p>}

    {address.label && <p className="event__panel__address">{address.label}</p>}

    {reviews && <ReviewScore reviews={reviews} poi={poi} />}

    <OpeningHour poi={poi} />
  </div>;
};

export default PoiEventItem;
