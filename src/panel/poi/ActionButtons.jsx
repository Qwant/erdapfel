/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import ShareMenu from 'src/components/ui/ShareMenu';

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
      title={_('Call', 'poi panel')}
    />;
  }

  render() {
    const shouldRenderPhone = this.props.poi.blocksByType && this.props.poi.blocksByType.phone;

    return <div className="poi_panel__actions">
      {this.props.isDirectionActive &&
        <Button
          className="poi_panel__action__direction"
          variant="primary"
          onClick={this.props.openDirection}
          title={_('Directions', 'poi panel')}
        >
          { _('Directions', 'poi panel') }
        </Button>
      }

      {shouldRenderPhone && this.renderPhone()}

      <Button
        className="poi_panel__action__button poi_panel__action__favorite"
        onClick={this.props.toggleStorePoi}
        icon={this.props.isPoiInFavorite ? 'icon_star-filled' : 'star'}
        title={_('Favorites', 'poi panel')}
      />

      <Button className="poi_panel__action__button poi_panel__action__share"
        title={_('Share', 'poi panel')}>
        <ShareMenu url={window.location.toString()}/>
      </Button>

    </div>;
  }
}
