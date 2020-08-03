/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import URI from '@qwant/uri';

import Telemetry from 'src/libs/telemetry';
import Block from 'src/panel/poi/blocks/Block';

export default class WebsiteBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
    poi: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.clickWebsite = () => {
      Telemetry.add('website', 'poi', this.props.poi.meta.source,
        Telemetry.buildInteractionData(
          {
            'id': this.props.poi.id,
            'source': this.props.poi.meta.source,
            'template': 'single',
            'zone': 'detail',
            'element': 'website',
          }
        )
      );
    };
  }

  render() {
    return <Block className="block-website" icon="icon_globe" title={_('Website')}>
      <a className="poi_panel__external_link"
        href={URI.externalise(this.props.block.url)}
        rel="noopener noreferrer nofollow"
        target="_blank"
        onClick={this.clickWebsite}
      >
        { URI.extractDomain(this.props.block.url) }
      </a>
    </Block>;
  }
}
