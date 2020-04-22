/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class ActionButtons extends React.Component {
  static propTypes = {
    poi: PropTypes.object.isRequired,
    isDirectionActive: PropTypes.bool,
    openDirection: PropTypes.func,
    openShare: PropTypes.func,
    isPhoneNumberVisible: PropTypes.bool,
    showPhoneNumber: PropTypes.func,
    isPoiInFavorite: PropTypes.bool,
    toggleStorePoi: PropTypes.func.isRequired,
  }

  renderPhone() {
    if (!this.props.isPhoneNumberVisible) {
      return <button className="poi_panel__action icon-icon_phone poi_phone_container_hidden"
        onClick={this.props.showPhoneNumber}
      >
        <div>{_('Show number', 'poi')}</div>
      </button>;
    }
    return <a className="poi_panel__action icon-icon_phone poi_phone_container_revealed"
      rel="noopener noreferrer external"
      href={this.props.poi.blocksByType.phone.url}
    >
      <div>{this.props.poi.blocksByType.phone.local_format}</div>
    </a>;
  }

  render() {
    const shouldRenderPhone = this.props.poi.blocksByType && this.props.poi.blocksByType.phone;

    return <div className="poi_panel__actions">
      <button className={classnames(
        'poi_panel__action',
        'poi_panel__actions__icon__store',
        {
          'icon-icon_star-filled': this.props.isPoiInFavorite,
          'icon-icon_star': !this.props.isPoiInFavorite,
        })
      }
      onClick={this.props.toggleStorePoi}
      >
        <div>{this.props.isPoiInFavorite ? _('Saved', 'poi') : _('Favorites', 'poi')}</div>
      </button>
      <button className="poi_panel__action icon-share-2" onClick={this.props.openShare}>
        <div>{_('Share', 'poi')}</div>
      </button>
      {this.props.isDirectionActive &&
        <button className="poi_panel__action icon-corner-up-right"
          onClick={this.props.openDirection}>
          <div>{_('Directions', 'poi')}</div>
        </button>
      }
      {shouldRenderPhone && this.renderPhone()}
    </div>;
  }
}
