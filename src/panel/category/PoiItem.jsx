import React from 'react';
import PoiTitle from 'src/components/PoiTitle';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import ReviewScore from 'src/components/ReviewScore';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';

const PoiItem = ({ poi }) => {
  const reviews = poi.blocksByType.grades;
  const address = poi.address || {};

  const Address = () =>
    address.label
      ? <p className="u-text--subtitle poiItem-address">{address.label}</p>
      : null
  ;

  const Reviews = () =>
    reviews
      ? <span className="poiItem-reviews">
        <ReviewScore reviews={reviews} poi={poi} inList />
      </span>
      : null
  ;

  const OpenStatus = () =>
    poi?.blocksByType?.opening_hours
      ? <OpeningHour
        schedule={new OsmSchedule(poi.blocksByType.opening_hours)}
        showNextOpenOnly={true}
        className="u-text--label"
      />
      : null;

  return <div className="poiItem">
    <div className="poiItem-left">
      <PoiTitle poi={poi} />
      <Address />
      <Reviews />
      <OpenStatus />
    </div>

    <div className="poiItem-right">
      <PoiTitleImage poi={poi} />
    </div>
  </div>;
};

export default PoiItem;
