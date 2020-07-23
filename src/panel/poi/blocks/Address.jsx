/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';

const AddressBlock = poi =>
  <div className="poi_panel__info__section">
    <div className="poi_panel__info__section__description">
      <div className="icon-map-pin poi_panel__block__symbol"></div>
      <div className="poi_panel__block__content">
        <span className="poi_panel__block__content__title">{_('Address')}</span>
        <span className="poi_panel__block__content__paragraph">
          {poi.address.label}
        </span>
      </div>
    </div>
  </div>
;

AddressBlock.propTypes = {
  block: PropTypes.object,
};

export default AddressBlock;
