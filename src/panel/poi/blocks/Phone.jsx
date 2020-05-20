import React from 'react';
import PropTypes from 'prop-types';

export default class PhoneBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
  }

  render() {
    const { block } = this.props;

    return <div className="poi_panel__info__section poi_panel__info__section--phone">
      <div className="poi_panel__info__section__description">
        <div className="icon-icon_phone poi_panel__block__symbol"></div>
        <div className="poi_panel__block__content">
          {block.local_format}
        </div>
      </div>
    </div>;
  }
}
