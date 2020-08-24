import React from 'react';
import PoiTitle from 'src/components/PoiTitle';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import ReviewScore from 'src/components/ReviewScore';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import classnames from 'classnames';

const PoiItem = ({ poi,
  withOpeningHours,
  withImage,
  withAlternativeName,
  className,
  ...rest
}) => {
  const reviews = poi.blocksByType?.grades;

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
      />
      : null;

  return <div className={classnames('poiItem', className)} {...rest}>
    <div className="poiItem-left">
      <div className="u-mb-4">
        <PoiTitle poi={poi} withAlternativeName={withAlternativeName} />
      </div>
      <Reviews />
      <OpenStatus />
    </div>

    {withImage && <div className="poiItem-right">
      <PoiTitleImage poi={poi} />
    </div>}
  </div>;
};

export default PoiItem;
