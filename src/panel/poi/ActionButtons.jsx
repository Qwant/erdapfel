/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Telemetry from '../../libs/telemetry';
import MasqFavoriteModal from '../../modals/masq_favorite_modal';
import Store from '../../adapters/store';

const store = new Store();

async function isPoiFavorite(poi) {
  try {
    const storePoi = await store.has(poi);
    return !!storePoi;
  } catch (e) {
    return false;
  }
}

export default class ActionButtons extends React.Component {
  static propTypes = {
    poi: PropTypes.object.isRequired,
    isDirectionActive: PropTypes.bool,
    isFromCategory: PropTypes.bool,
    isFromFavorite: PropTypes.bool,
    openDirection: PropTypes.func,
    openShare: PropTypes.func,
  }

  state = {
    showPhoneNumber:
      !(this.props.poi.isFromPagesjaunes &&
      this.props.poi.isFromPagesjaunes()),
    poiIsInFavorite: false,
  };

  componentDidMount() {
    this.storeAddHandler = listen('poi_added_to_favs', poi => {
      if (poi === this.props.poi) {
        this.setState({ poiIsInFavorite: true });
      }
    });

    this.storeRemoveHandler = listen('poi_removed_from_favs', poi => {
      if (poi === this.props.poi) {
        this.setState({ poiIsInFavorite: false });
      }
    });

    isPoiFavorite(this.props.poi).then(poiIsInFavorite => {
      this.setState({ poiIsInFavorite });
    });
  }

  componentWillUnmount() {
    window.unListen(this.storeAddHandler);
    window.unListen(this.storeRemoveHandler);
  }

  showPhone = () => {
    if (this.props.poi && this.props.poi.meta && this.props.poi.meta.source) {
      Telemetry.add('phone', 'poi', this.props.poi.meta.source,
        Telemetry.buildInteractionData({
          id: this.props.poi.id,
          source: this.props.poi.meta.source,
          template: 'single',
          zone: 'detail',
          element: 'phone',
        })
      );
    }
    this.setState({ showPhoneNumber: true });
  }

  renderPhone() {
    if (!this.state.showPhoneNumber) {
      return <button className="poi_panel__action icon-icon_phone poi_phone_container_hidden"
        onClick={this.showPhone}
      >
        <div>{_('SHOW NUMBER', 'poi')}</div>
      </button>;
    }
    return <a className="poi_panel__action icon-icon_phone poi_phone_container_revealed"
      rel="noopener noreferrer external"
      href={this.props.poi.blocksByType.phone.url}
    >
      <div>{this.props.poi.blocksByType.phone.local_format}</div>
    </a>;
  }

  toggleStorePoi = async () => {
    if (this.props.poi.meta && this.props.poi.meta.source) {
      Telemetry.add('favorite', 'poi', this.props.poi.meta.source);
    }
    if (this.state.poiIsInFavorite) {
      store.del(this.props.poi);
    } else {
      if (this.isMasqEnabled) {
        const isLoggedIn = await store.isLoggedIn();
        if (!isLoggedIn) {
          const masqFavoriteModal = new MasqFavoriteModal();
          masqFavoriteModal.open();
          await masqFavoriteModal.waitForClose();
        }
      }
      store.add(this.props.poi);
    }
  }

  render() {
    const shouldRenderPhone = this.props.poi.blocksByType && this.props.poi.blocksByType.phone;

    return <div className="poi_panel__actions">
      <button className={classnames(
        'poi_panel__action',
        'poi_panel__actions__icon__store',
        {
          'icon-icon_star-filled': this.state.poiIsInFavorite,
          'icon-icon_star': !this.state.poiIsInFavorite,
        })
      }
      onClick={this.toggleStorePoi}
      >
        <div>{this.state.poiIsInFavorite ? _('SAVED', 'poi') : _('FAVORITES', 'poi')}</div>
      </button>
      <button className="poi_panel__action icon-share-2" onClick={this.props.openShare}>
        <div>{_('SHARE', 'poi')}</div>
      </button>
      {this.props.isDirectionActive &&
        <button className="poi_panel__action icon-corner-up-right"
          onClick={this.props.openDirection}>
          <div>{_('DIRECTIONS', 'poi')}</div>
        </button>
      }
      {shouldRenderPhone && this.renderPhone()}
    </div>;
  }
}
