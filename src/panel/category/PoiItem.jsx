import React from 'react';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import ReviewScore from 'src/components/ReviewScore';
import poiSubClass from 'src/mapbox/poi_subclass';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';

const PoiItem = ({ poi }) => {
  const reviews = poi.blocksByType.grades;
  const address = poi.address || {};

  const Subclass = () =>
    poi.subClassName
      ? <p className="u-text--subtitle u-firstCap">{poiSubClass(poi.subClassName)}</p>
      : null
  ;

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
        showNextOpenOnly={true} />
      : null;

  return <div className="poiItem">
    <div className="poiItem-left">
      {/* @TODO: use a better-named fonction that returns the best 'name' */}
      <h3 className="u-text--smallTitle">{poi.getInputValue()}</h3>
      <Subclass />
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
