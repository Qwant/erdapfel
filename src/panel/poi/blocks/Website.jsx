/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import URI from '@qwant/uri';

import Telemetry from 'src/libs/telemetry';
import Block from 'src/panel/poi/blocks/Block';

const WebsiteBlock = ({ block, poi }) => {
  const onClickWebsite = () => {
    Telemetry.sendPoiEvent(poi, 'website',
      Telemetry.buildInteractionData(
        {
          'id': poi.id,
          'source': poi.meta.source,
          'template': 'single',
          'zone': 'detail',
          'element': 'website',
        }
      )
    );
  };

  const getWebsiteLabel = () => {
    return block.label || URI.extractDomain(block.url);
  };

  return <Block className="block-website" icon="icon_globe" title={_('website')}>
    <a
      href={URI.externalise(block.url)}
      rel="noopener noreferrer nofollow"
      target="_blank"
      onClick={onClickWebsite}
    >
      {getWebsiteLabel()}
    </a>
  </Block>;
};

WebsiteBlock.propTypes = {
  block: PropTypes.object,
  poi: PropTypes.object,
};

export default WebsiteBlock;
