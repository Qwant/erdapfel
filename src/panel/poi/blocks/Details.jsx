import React from 'react';
import StarsBlock, { hasStars } from './Stars';
import AccessibilityBlock from './Accessibility';
import InternetAccessBlock from './InternetAccess';
import DeliveryBlock, { hasActiveDeliveryModes } from './Delivery';
import { Divider } from 'src/components/ui';
import { findBlock } from 'src/libs/pois';
import { useI18n } from 'src/hooks';
import poiSubClass from 'src/mapbox/poi_subclass';

const DetailsBlock = ({ poi }) => {
  const { _ } = useI18n();
  const subclass = poiSubClass(poi.subClassName);
  const accessibility = findBlock(poi.blocks, 'accessibility');
  const internetAccess = findBlock(poi.blocks, 'internet_access');
  const delivery = findBlock(poi.blocks, 'delivery');
  const stars = findBlock(poi.blocks, 'stars');

  if (!accessibility && !internetAccess && !hasStars(stars) && !hasActiveDeliveryModes(delivery)) {
    return null;
  }

  return (
    <>
      <Divider paddingTop={0} />
      <h3 className="u-text--smallTitle u-mb-xs">{_('Steps')}</h3>
      <div className="poi_panel__fullWidth u-mb-s">
        {stars && <StarsBlock block={stars} subclass={subclass} />}
        {accessibility && <AccessibilityBlock block={accessibility} />}
        {internetAccess && <InternetAccessBlock block={internetAccess} />}
        {hasActiveDeliveryModes(delivery) && <DeliveryBlock block={delivery} />}
      </div>
    </>
  );
};

export default DetailsBlock;
