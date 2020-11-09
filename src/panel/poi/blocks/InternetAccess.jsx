/* global _ */
import React from 'react';

const InternetAccessBlock = ({
  block,
  asString,
}) => {
  if (!block.wifi) {
    return null;
  } else if (asString) {
    return `${_('Internet access', 'poi')} : ${_('WiFi', 'poi')}`;
  }
  return <div className="u-mb-s">
    <h6 className="u-text--caption u-mb-xxs">
      { _('Internet access', 'poi') }
    </h6>
    <ul>
      <li className="poi_panel__info__item">
        { _('WiFi', 'poi') }
      </li>
    </ul>
  </div>;
};

export default InternetAccessBlock;
