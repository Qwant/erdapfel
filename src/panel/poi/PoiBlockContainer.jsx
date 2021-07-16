import React from 'react';
import PropTypes from 'prop-types';
import ImagesBlock from './blocks/Images';
import InformationBlock from './blocks/Information';
import DetailsBlock from './blocks/Details';
import WikiBlock from './blocks/Wiki';
import { findBlock } from 'src/libs/pois';

const PoiBlockContainer = ({ poi }) => {
  if (!poi) {
    return null;
  }

  const wikipedia = findBlock(poi.blocks, 'wikipedia');

  return (
    <div className="poi_panel__info">
      {wikipedia && (
        <div className="u-mb-m">
          <WikiBlock block={wikipedia} />
        </div>
      )}
      <InformationBlock poi={poi} />
      <ImagesBlock poi={poi} />
      <DetailsBlock poi={poi} />
    </div>
  );
};

PoiBlockContainer.propTypes = {
  poi: PropTypes.object,
  covid19Enabled: PropTypes.bool,
};

export default PoiBlockContainer;
