/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';

import Button from 'src/components/ui/Button';

export default class ActionButtons extends React.Component {
  static propTypes = {
    poi: PropTypes.object.isRequired,
    isDirectionActive: PropTypes.bool,
    openDirection: PropTypes.func,
    openShare: PropTypes.func,
    onClickPhoneNumber: PropTypes.func,
    isPoiInFavorite: PropTypes.bool,
    toggleStorePoi: PropTypes.func.isRequired,
  }

  renderPhone() {
    const { onClickPhoneNumber, poi } = this.props;
    return <Button
      className="poi_panel__action__button poi_panel__action__phone"
      onClick={onClickPhoneNumber}
      icon="icon_phone"
      href={poi.blocksByType.phone.url}
      rel="noopener noreferrer external"
    />;
  }

  render() {
    const shouldRenderPhone = this.props.poi.blocksByType && this.props.poi.blocksByType.phone;

    return <div className="poi_panel__actions">
      {this.props.isDirectionActive &&
        <Button
          className="button--noBorder poi_panel__action__direction"
          variant="invert"
          onClick={this.props.openDirection}
        >
          { _('Directions', 'poi panel') }
        </Button>
      }

      {shouldRenderPhone && this.renderPhone()}

      <Button
        className="poi_panel__action__button poi_panel__action__favorite"
        onClick={this.props.toggleStorePoi}
        icon={this.props.isPoiInFavorite ? 'icon_star-filled' : 'star'}
      />

      <Button
        className="poi_panel__action__button poi_panel__action__share"
        onClick={this.props.openShare}
        icon="share-2"
      />
    </div>;
  }
}
