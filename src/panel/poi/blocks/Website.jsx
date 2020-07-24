/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import URI from '@qwant/uri';
import Telemetry from 'src/libs/telemetry';

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
    return <div className="poi_panel__info__section poi_panel__info__section--website">
      <div className="poi_panel__info__section__description">
        <div className="icon-icon_globe poi_panel__block__symbol" />
        <div className="poi_panel__block__content">
          <span className="poi_panel__block__content__title">
            {_('Website')}
          </span>
          <a className="poi_panel__block__content__paragraph poi_panel__info__link"
            href={URI.externalise(this.props.block.url)}
            rel="noopener noreferrer nofollow"
            target="_blank"
            onClick={this.clickWebsite}
          >
            { URI.extractDomain(this.props.block.url) }
          </a>
        </div>
      </div>
    </div>;
  }
}
