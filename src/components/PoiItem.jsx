import React from 'react';
import PoiTitle from 'src/components/PoiTitle';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import ReviewScore from 'src/components/ReviewScore';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import classnames from 'classnames';
import MultilineAddress from 'src/components/ui/Address';

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
      ? <div className="u-text--subtitle poiItem-address">
        <MultilineAddress address={address} omitCountry={poi.type !== 'admin'} />
      </div>
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
        withIcon
        schedule={new OsmSchedule(poi.blocksByType.opening_hours)}
        showNextOpenOnly={true}
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
