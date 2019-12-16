import React from 'react';
import OpeningHour from 'src/components/OpeningHour';
import ReviewScore from 'src/components/ReviewScore';
import PhoneNumber from './PhoneNumber';
import poiSubClass from 'src/mapbox/poi_subclass';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';

const PoiCategoryItem = ({ poi, onShowPhoneNumber }) => {
  const reviews = poi.blocksByType.grades;
  const phoneBlock = poi.blocksByType.phone;
  const address = poi.address || {};

  return <div className="category__panel__item">
    <PoiTitleImage poi={poi} />

    <h3 className="category__panel__name">{poi.getInputValue()}</h3>

    {poi.subClassName && <p className="category__panel__type">{poiSubClass(poi.subClassName)}</p>}

    {address.label && <p className="category__panel__address">{address.label}</p>}

    {reviews && <ReviewScore reviews={reviews} poi={poi} inList />}

    <OpeningHour poi={poi} />

    {phoneBlock && <PhoneNumber
      phoneBlock={phoneBlock}
      onReveal={() => { onShowPhoneNumber(poi); }} />}
  </div>;
};

export default PoiCategoryItem;
