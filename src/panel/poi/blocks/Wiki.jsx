/* global _ */
import React from 'react';

const WikiBlock = ({
  block,
}) => {
  return <div className="poi_panel__info__wiki">
    { block.description && <p>{block.description}</p> }
    { block.url && <a
      rel="noopener noreferrer"
      target="_blank"
      href={ block.url }
    >
      {_('Read more on Wikipedia')}
    </a>}
  </div>;
};

export default WikiBlock;
