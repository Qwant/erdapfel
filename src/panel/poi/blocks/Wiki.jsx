/* global _ */
import React from 'react';
import Flex from 'src/components/ui/Flex';

const WikiBlock = ({
  block,
}) => {
  return <div className="poi_panel__info__wiki">
    { block.description &&
      <p className="poi_panel__description__ellipsis">
        { block.description }
      </p> }
    <br/>
    { block.url && <Flex justifyContent="center">
      <a
        rel="noopener noreferrer"
        target="_blank"
        href={ block.url }
      >
        <span>{_('Read more on Wikipedia')}</span>
      </a>
    </Flex>}
  </div>;
};

export default WikiBlock;
