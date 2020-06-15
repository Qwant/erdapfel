import React from 'react';
import PoiTitle from 'src/components/PoiTitle';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import ReviewScore from 'src/components/ReviewScore';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import classnames from 'classnames';

const PoiItem = ({ poi,
  withOpeningHours,
  withImage = true,
  withAlternativeName,
  className,
  ...rest
}) => {
  const reviews = poi.blocksByType?.grades;
  const address = poi.address || {};

  const Address = () =>
    poi.subClassName !== 'latlon' && address.label
      ? <div className="u-text--subtitle poiItem-address">{address.label}</div>
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
    withOpeningHours && poi?.blocksByType?.opening_hours
      ? <OpeningHour
        schedule={new OsmSchedule(poi.blocksByType.opening_hours)}
        showNextOpenOnly={true}
        className="u-text--label"
      />
      : null;

  return <div className={classnames('poiItem', className)} {...rest}>
    <div className="poiItem-left">
      <PoiTitle poi={poi} withAlternativeName={withAlternativeName} />
      <Address />
      <Reviews />
      <OpenStatus />
    </div>

    {withImage && <div className="poiItem-right">
      <PoiTitleImage poi={poi} />
    </div>}
  </div>;
};

export default PoiItem;
