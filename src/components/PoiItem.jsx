import React from 'react';
import PoiTitle from 'src/components/PoiTitle';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import ReviewScore from 'src/components/ReviewScore';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import Address from 'src/components/ui/Address';
import classnames from 'classnames';
import poiSubClass from 'src/mapbox/poi_subclass';
import { capitalizeFirst } from 'src/libs/string';

const PoiItem = React.memo(({ poi,
  withOpeningHours,
  withImage,
  withAlternativeName,
  className,
  inList,
  ...rest
}) => {
  const reviews = poi.blocksByType?.grades;

  const subclass = capitalizeFirst(poiSubClass(poi.subClassName));

  const openingHours = withOpeningHours && poi?.blocksByType?.opening_hours;

  return <div className={classnames('poiItem', className)} {...rest}>
    <div className="poiItem-left">
      <div className="u-mb-xxs">
        <PoiTitle poi={poi} withAlternativeName={withAlternativeName} inList={inList} />
      </div>
      {reviews && <div className="poiItem-reviews">
        <ReviewScore reviews={reviews} poi={poi} inList={inList} />
      </div>}
      <div className="poiItem-subclassAndHours">
        <div className="poiItem-subclass u-text--subtitle">{subclass}</div>
        {inList && subclass && openingHours && '\u00A0⋅\u00A0'}
        {openingHours && <div className="poiItem-openingHour">
          <OpeningHour schedule={new OsmSchedule(poi.blocksByType.opening_hours)} />
        </div>}
      </div>
      {inList && <div className="poiItem-address u-text--subtitle u-ellipsis">
        <Address address={poi.address} inline omitCountry />
      </div>}
    </div>

    {withImage && <div className="poiItem-right">
      <PoiTitleImage poi={poi} />
    </div>}
  </div>;
});
PoiItem.displayName = 'PoiItem';

export default PoiItem;
