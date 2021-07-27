/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import URI from '@qwant/uri';

import Telemetry from 'src/libs/telemetry';
import Block from 'src/panel/poi/blocks/Block';
import { IconEarth } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const WebsiteBlock = ({ block, poi }) => {
  const onClickWebsite = () => {
    Telemetry.sendPoiEvent(
      poi,
      'website',
      Telemetry.buildInteractionData({
        id: poi.id,
        source: poi.meta.source,
        template: 'single',
        zone: 'detail',
        element: 'website',
      })
    );
  };

  const getWebsiteLabel = () => {
    return block.label || URI.extractDomain(block.url);
  };

  return (
    <Block
      className="block-website"
      icon={<IconEarth width={20} fill={ACTION_BLUE_BASE} />}
      title={_('website')}
      onClick={onClickWebsite}
      href={URI.externalise(block.url)}
      rel="noopener noreferrer nofollow"
      target="_blank"
    >
      {getWebsiteLabel()}
    </Block>
  );
};

WebsiteBlock.propTypes = {
  block: PropTypes.object,
  poi: PropTypes.object,
};

export default WebsiteBlock;
