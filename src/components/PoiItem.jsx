import React from 'react';
import PoiTitle from 'src/components/PoiTitle';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import ReviewScore from 'src/components/ReviewScore';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import Address from 'src/components/ui/Address';
import Stars, { hasStars } from 'src/panel/poi/blocks/Stars';
import classnames from 'classnames';
import poiSubClass from 'src/mapbox/poi_subclass';
import { capitalizeFirst } from 'src/libs/string';
import { findBlock } from 'src/libs/pois';
import { useI18n } from 'src/hooks';
const PoiItem = React.memo(
  ({ poi, withOpeningHours, withImage, withAlternativeName, className, inList, ...rest }) => {
    const reviews = poi.blocksByType?.grades;
    const { _ } = useI18n();
    const subclass = capitalizeFirst(poiSubClass(poi.subClassName));
    const stars = findBlock(poi.blocks, 'stars');
    const openingHours = withOpeningHours && poi?.blocksByType?.opening_hours;
    const texts = {
      opening_hours: _('opening hours'),
      open: _('Open'),
      closed: _('Closed'),
      open_24_7: _('Open 24/7'),
      reopening: _('reopening at {nextTransitionTime}'),
      until: _('until {nextTransitionTime}'),
    };

    return (
      <div className={classnames('poiItem', className)} {...rest}>
        <div className="poiItem-left">
          <div className="u-mb-xxs">
            <PoiTitle poi={poi} withAlternativeName={withAlternativeName} inList={inList} />
          </div>
          {reviews && (
            <div className="poiItem-reviews">
              <ReviewScore reviews={reviews} poi={poi} inList={inList} source={poi?.meta?.source} />
            </div>
          )}
          <div className="poiItem-subclassStarsAndHours">
            <span className="poiItem-subclass">{subclass}</span>
            {subclass && hasStars(stars) && '\u00A0⋅\u00A0'}
            <Stars block={stars} inline />
            {inList && subclass && openingHours && '\u00A0⋅\u00A0'}
            {openingHours && (
              <div className="poiItem-openingHour">
                <OpeningHour
                  schedule={new OsmSchedule(poi.blocksByType.opening_hours)}
                  texts={texts}
                />
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
