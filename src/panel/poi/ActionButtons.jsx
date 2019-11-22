/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Telemetry from '../../libs/telemetry';
import MasqFavoriteModal from '../modals/masq_favorite_modal';
import Store from '../../adapters/store';

const store = new Store();
const masqFavoriteModal = new MasqFavoriteModal();

async function isPoiFavorite(poi) {
  try {
    const storePoi = await store.has(poi);
    if (storePoi) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

export default class ActionButtons extends React.Component {
  static propTypes = {
    poi: PropTypes.object.isRequired,
    isDirectionActive: PropTypes.bool,
    isFromCategory: PropTypes.bool,
    isFromFavorite: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      showPhoneNumber: false,
      poiIsInFavorite: this.props.poi.stored,
    };

    isPoiFavorite(this.props.poi).then(x => this.setState({ poiIsInFavorite: x }));

    store.onToggleStore(async () => {
      this.setState({
        poiIsInFavorite: await isPoiFavorite(this.props.poi),
      });
    });

    store.eventTarget.addEventListener('poi_added', async () => {
      if (!this.state.poiIsInFavorite) {
        this.setState({
          poiIsInFavorite: await isPoiFavorite(this.props.poi),
        });
      }
    });
  }

  shouldPhoneBeHidden() {
    return this.props.poi &&
      this.props.poi.isFromPagesjaunes &&
      this.props.poi.isFromPagesjaunes() &&
      !this.state.showPhoneNumber;
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
    this.setState({
      showPhoneNumber: true,
    });
  }

  renderPhone() {
    if (this.shouldPhoneBeHidden()) {
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
      await store.del(this.props.poi);
      this.setState({
        poiIsInFavorite: false,
      });
    } else {
      if (this.isMasqEnabled) {
        const isLoggedIn = await store.isLoggedIn();
        if (!isLoggedIn) {
          masqFavoriteModal.open();
          await masqFavoriteModal.waitForClose();
        }
      }

      await store.add(this.props.poi);
      this.setState({
        poiIsInFavorite: true,
      });
    }
  }

  openDirection = () => {
    if (!window.app) {
      return;
    }
    window.app.navigateTo('/routes/', {
      poi: this.props.poi,
      isFromCategory: this.props.isFromCategory,
      isFromFavorite: this.props.isFromFavorite,
    });
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
      <button className="poi_panel__action icon-share-2" onClick={this.openShare}>
        <div>{_('SHARE', 'poi')}</div>
      </button>
      {this.props.isDirectionActive &&
        <button className="poi_panel__action icon-corner-up-right"
          onClick={this.openDirection}>
          <div>{_('DIRECTIONS', 'poi')}</div>
        </button>
      }
      {shouldRenderPhone && this.renderPhone()}
    </div>;
  }
}
