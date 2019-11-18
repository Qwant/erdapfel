/* global _ */
import React from 'react';

const WikiBlock = ({
  block,
}) => {
  return <div>
    <div className="icon-icon_info poi_panel__block__symbol" />
    <div className="poi_panel__info__wiki">
      { block.description &&
        <p className="poi_panel__description__ellipsis">
          { block.description }
        </p> }
      <br/>
      { block.url &&
        <a
          className="poi_panel__info__wiki__link"
          rel="noopener noreferrer"
          target="_blank"
          href={ block.url } >
          <i className="icon-chevrons-right"/><span>{ _('WIKIPEDIA') }</span>
        </a> }
    </div>
  </div>;
};

export default WikiBlock;
