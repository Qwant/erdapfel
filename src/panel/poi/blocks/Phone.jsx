import React from 'react';
import PropTypes from 'prop-types';

const PhoneBlock = ({ block }) =>
  <div className="poi_panel__info__section poi_panel__info__section--phone">
    <div className="poi_panel__info__section__description">
      <div className="icon-icon_phone poi_panel__block__symbol"></div>
      <div className="poi_panel__block__content">
        <a href={block.url}>{block.local_format}</a>
      </div>
    </div>
  </div>
;

PhoneBlock.propTypes = {
  block: PropTypes.object,
};

export default PhoneBlock;
