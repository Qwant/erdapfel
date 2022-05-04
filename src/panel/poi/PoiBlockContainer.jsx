import React from 'react';
import PropTypes from 'prop-types';
import ImagesBlock from './blocks/Images';
import InformationBlock from './blocks/Information';
import DetailsBlock from './blocks/Details';
import DescriptionBlock from './blocks/Description';
import UserReviewsBlock from './blocks/UserReviews';

const PoiBlockContainer = ({ poi }) => {
  if (!poi) {
    return null;
  }

  return (
    <div className="poi_panel__info">
      <DescriptionBlock poi={poi} />
      <InformationBlock poi={poi} />
      <UserReviewsBlock poi={poi} />
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
