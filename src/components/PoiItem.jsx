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
import { findBlock } from 'src/libs/pois';
import { useI18n } from 'src/hooks';

const PoiItem = React.memo(
  ({ poi, withOpeningHours, withImage, withAlternativeName, className, inList, ...rest }) => {
    const reviews = poi.blocksByType?.grades;

    const subclass = capitalizeFirst(poiSubClass(poi.subClassName));
    const stars = findBlock(poi.blocks, 'stars');
    const hasStars = stars?.ratings?.[0]?.has_stars === 'yes';
    const openingHours = withOpeningHours && poi?.blocksByType?.opening_hours;
    const { _, _n } = useI18n();

    return (
      <div className={classnames('poiItem', className)} {...rest}>
        <div className="poiItem-left">
          <div className="u-mb-xxs">
            <PoiTitle poi={poi} withAlternativeName={withAlternativeName} inList={inList} />
          </div>
          {reviews && (
            <div className="poiItem-reviews">
              <ReviewScore reviews={reviews} poi={poi} inList={inList} />
            </div>
          )}
          <div className="poiItem-subclassStarsAndHours">
            <span className="poiItem-subclass">{subclass}</span>
            {!inList && subclass && hasStars && '\u00A0⋅\u00A0'}
            {!inList && hasStars && (
              <span>
                {stars.ratings[0].nb_stars > 0
                  ? _n('%d star', '%d stars', stars.ratings[0].nb_stars, 'poi')
                  : _('Starred', 'poi')}
              </span>
            )}
            {inList && subclass && openingHours && '\u00A0⋅\u00A0'}
            {openingHours && (
              <div className="poiItem-openingHour">
                <OpeningHour schedule={new OsmSchedule(poi.blocksByType.opening_hours)} />
              </div>
            )}
          </div>
          {inList && (
            <div className="poiItem-address u-ellipsis">
              <Address address={poi.address} inline omitCountry />
            </div>
          )}
        </div>

        {withImage && (
          <div className="poiItem-right">
            <PoiTitleImage poi={poi} />
          </div>
        )}
      </div>
    );
  }
);
PoiItem.displayName = 'PoiItem';

export default PoiItem;
