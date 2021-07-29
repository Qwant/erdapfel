import React from 'react';
import AccessibilityBlock from './Accessibility';
// import BreweryBlock from './Brewery';
import InternetAccessBlock from './InternetAccess';
import DeliveryBlock from './Delivery';
import { Divider } from 'src/components/ui';
import { findBlock } from 'src/libs/pois';
import { useI18n } from 'src/hooks';
import { hasDisplayableDelivery } from './helpers';

const DetailsBlock = ({ poi }) => {
  const { _ } = useI18n();

  const accessibility = findBlock(poi.blocks, 'accessibility');
  const internetAccess = findBlock(poi.blocks, 'internet_access');
  const delivery = findBlock(poi.blocks, 'delivery');
  // const brewery = findBlock(poi.blocks, 'brewery');
  // {brewery && <BreweryBlock block={brewery} />}

  if (!accessibility && !internetAccess && !hasDisplayableDelivery(delivery)) {
    return null;
  }

  return (
    <>
      <Divider paddingTop={0} />
      <h3 className="u-text--smallTitle u-mb-xs">{_('Details')}</h3>
      <div className="poi_panel__fullWidth u-mb-s">
        {accessibility && <AccessibilityBlock block={accessibility} />}
        {internetAccess && <InternetAccessBlock block={internetAccess} />}
        {hasDisplayableDelivery(delivery) && <DeliveryBlock block={delivery} />}
      </div>
    </>
  );
};

export default DetailsBlock;
