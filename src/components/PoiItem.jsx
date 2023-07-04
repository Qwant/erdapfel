import React from 'react';
import PoiTitle from 'src/components/PoiTitle';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import ReviewScore from 'src/components/ReviewScore';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import Address from 'src/components/ui/Address';
import Stars, { hasStars } from 'src/panel/poi/blocks/Stars';
import cx from 'classnames';
import poiSubClass from 'src/mapbox/poi_subclass';
import { capitalizeFirst } from 'src/libs/string';
import { findBlock } from 'src/libs/pois';
import { useI18n } from 'src/hooks';
import { EcoResponsiblePanelTopMention } from 'src/panel/category/EcoResponsiblePanelTopMention';
import { getEcoResponsibleCategoryFromURL } from 'src/libs/eco-responsible';
import { Flex } from '@qwant/qwant-ponents';

const PoiItem = React.memo(
  ({ poi, withOpeningHours, withAlternativeName, className, inList, ...rest }) => {
    const { _ } = useI18n();
    const ecoResponsibleCategory = getEcoResponsibleCategoryFromURL();
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
      <div className={cx('poiItem', className)} {...rest}>
        <Flex column fullWidth>
          {ecoResponsibleCategory && !inList && (
            <Flex mb="l">
              <EcoResponsiblePanelTopMention
                category={ecoResponsibleCategory}
                isPoiDetails
                isImageless
                linkHref={poi?.blocksByType?.ecoresponsible?.url}
              />
            </Flex>
          )}
          <Flex>
            <div className="poiItem-left">
              <PoiTitle poi={poi} withAlternativeName={withAlternativeName} inList={inList} />
              {(poi?.blocksByType?.grades || poi?.blocksByType?.ecoresponsible) && (
                <ReviewScore poi={poi} inList={inList} source={poi?.meta?.source} />
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
            <div className="poiItem-right">
              <PoiTitleImage
                isDetails={!inList}
                poi={poi}
                isEcoResponsible={ecoResponsibleCategory}
              />
            </div>
          </Flex>
        </Flex>
      </div>
    );
  }
);
PoiItem.displayName = 'PoiItem';

export default PoiItem;
