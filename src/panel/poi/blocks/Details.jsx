import React from 'react';
import AccessibilityBlock from './Accessibility';
// import BreweryBlock from './Brewery';
import InternetAccessBlock from './InternetAccess';
import { Divider } from 'src/components/ui';
import { findBlock } from 'src/libs/pois';
import { useI18n } from 'src/hooks';

const DetailsBlock = ({ poi }) => {
  const { _ } = useI18n();

  const accessibility = findBlock(poi.blocks, 'accessibility');
  const internetAccess = findBlock(poi.blocks, 'internet_access');
  // const brewery = findBlock(poi.blocks, 'brewery');
  // {brewery && <BreweryBlock block={brewery} />}

  if (!accessibility && !internetAccess) {
    return null;
  }

  return (
    <>
      <Divider paddingTop={0} />
      <h3 className="u-text--smallTitle">{_('Details')}</h3>
      <div className="poi_panel__fullWidth u-mb-s">
        {accessibility && <AccessibilityBlock block={accessibility} />}
        {internetAccess && <InternetAccessBlock block={internetAccess} />}
      </div>
    </>
  );
};

export default DetailsBlock;
