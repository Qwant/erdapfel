import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Telemetry from '../libs/telemetry';
import nconf from '@qwant/nconf-getter';
import layouts from './layouts.js';

import PoiHeader from 'src/panel/poi/PoiHeader';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import OpeningHour from 'src/components/OpeningHour';
import OsmContribution from 'src/components/OsmContribution';
import PoiBlockContainer from './poi_bloc/PoiBlockContainer';

import Store from '../adapters/store';
import MasqFavoriteModal from '../modals/masq_favorite_modal';
import CategoryService from '../adapters/category_service';
import { openShareModal } from 'src/modals/ShareModal';

import PoiStore from '../adapters/poi/poi_store';

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

export default class PoiPanel extends React.Component {
  static propTypes = {
    poi: PropTypes.object,
    isFromFavorite: PropTypes.bool,
    isFromCategory: PropTypes.bool,
    sourceCategory: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.poi = props.poi;
    if (props.poi) {
      this.poi = PoiStore.deserialize(props.poi);
    }
    this.state = {
      isCollapsed: true,
      card: true,
      showPhoneNumber: false,
      poiIsInFavorite: this.poi.stored,
    };
    this.categories = CategoryService.getCategories();
    this.isDirectionActive = nconf.get().direction.enabled;
    this.isMasqEnabled = nconf.get().masq.enabled;

    isPoiFavorite(this.poi).then(x => this.setState({poiIsInFavorite: x}));
    this.active = true;

    store.onToggleStore(async () => {
      if (this.poi) {
        this.setState({
          poiIsInFavorite: await isPoiFavorite(this.poi)
        });
      }
    });

    store.eventTarget.addEventListener('poi_added', async () => {
      if (this.poi && !this.state.poiIsInFavorite) {
        this.setState({
          poiIsInFavorite: await isPoiFavorite(this.poi)
        });
      }
    });

    window.execOnMapLoaded(() => {
      const elem = document.querySelector('.poi_panel__content__card');

      if (!elem) {
        return;
      }
      fire(
        'move_mobile_bottom_ui',
        elem.offsetHeight + 20
      );
    });
  }

  expandCollapse = () => {
    this.setState(state => ({
      isCollapsed: !state.isCollapsed,
    }));
  }

  backToFavorite = () => {
    if (!window.app) {
      return;
    }
    Telemetry.add(Telemetry.POI_BACKTOFAVORITE);
    window.app.navigateTo('/favs');
  }

  openDirection = () => {
    if (!window.app) {
      return;
    }
    window.app.navigateTo('/routes/', {
      poi: this.poi,
      isFromCategory: this.props.isFromCategory,
      isFromFavorite: this.props.isFromFavorite,
    });
  }

  showDetail = () => {
    if (this.poi.meta && this.poi.meta.source) {
      Telemetry.add(Telemetry.POI_SEE_MORE, null, null,
        Telemetry.buildInteractionData({
          id: this.poi.id,
          source: this.poi.meta.source,
          template: 'single',
          zone: 'detail',
          element: 'more',
        })
      );
    }
    this.setState({
      card: false,
    });
  }

  center = () => {
    if (this.poi.meta && this.poi.meta.source) {
      Telemetry.add('go', 'poi', this.poi.meta.source);
    }
    fire('fit_map', this.poi, layouts.POI);
  }

  toggleStorePoi = async () => {
    if (this.poi.meta && this.poi.meta.source) {
      Telemetry.add('favorite', 'poi', this.poi.meta.source);
    }
    if (this.state.poiIsInFavorite) {
      await store.del(this.poi);
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

      await store.add(this.poi);
      this.setState({
        poiIsInFavorite: true,
      });
    }
  }

  openShare = () => {
    if (this.poi.meta && this.poi.meta.source) {
      Telemetry.add('share', 'poi', this.poi.meta.source);
    }
    if (this.poi) {
      openShareModal(this.poi.toAbsoluteUrl());
    }
  }

  showPhone = () => {
    const poi = this.poi;
    if (poi && poi.meta && poi.meta.source) {
      Telemetry.add('phone', 'poi', poi.meta.source,
        Telemetry.buildInteractionData({
          id: poi.id,
          source: poi.meta.source,
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

  closeAction = () => {
    if (!window.app) {
      return;
    }
    window.app.navigateTo('/');
  }

  openCategory = category => {
    if (!window.app) {
      return;
    }
    window.app.navigateTo(`/places/?type=${category.name}`);
  }

  backToList = () => {
    if (!window.app) {
      return;
    }
    Telemetry.add(Telemetry.POI_BACKTOLIST);
    fire('restore_location');
    window.app.navigateTo(`/places/?type=${this.props.sourceCategory}`);
  }

  backToSmall = () => {
    this.setState({
      card: true,
    });
  }

  shouldPhoneBeHidden() {
    return this.poi &&
      this.poi.isFromPagesjaunes &&
      this.poi.isFromPagesjaunes() &&
      !this.state.showPhoneNumber;
  }

  renderPhone() {
    const elems = [];

    if (this.shouldPhoneBeHidden()) {
      return <button className="poi_panel__action icon-icon_phone poi_phone_container_hidden"
        onClick={this.showPhone}
      >
        <div>{_('SHOW NUMBER', 'poi')}</div>
      </button>;
    }
    return <a className="poi_panel__action icon-icon_phone poi_phone_container_revealed"
      rel="noopener noreferrer external"
      href={this.poi.blocksByType.phone.url}
    >
      <div>{this.poi.blocksByType.phone.local_format}</div>
    </a>;
  }

  render() {
    if (!this.poi || !this.active) {
      return null;
    }
    const data = {
      className: 'poi_panel__back_to_list',
    };
    const pagesjaunes = this.poi.isFromPagesjaunes && this.poi.isFromPagesjaunes() ?
      <img className="poi_panel__back_to_list_logo"
        src="./statics/images/pagesjaunes.svg"
        alt="PagesJaunes" />
      : null;

    if (this.props.isFromFavorite) {
      data.callback = this.backToFavorite;
      data.text = _('Back to favorite');
    } else if (this.props.isFromCategory) {
      data.callback = this.backToList;
      data.text = _('Back to list');
    } else if (!this.state.card) {
      data.callback = this.backToSmall;
      data.text = _('Back');
      data.className = 'poi_panel__back_mobile';
    };
    return <div>
      <div className={classnames('poi_panel__header', {
          'poi_header_card': this.state.card,
          'poi_header_back_to_list': this.props.isFromFavorite || this.props.isFromCategory,
        })}
      >
        {data.text && data.callback &&
          <div className={data.className} onClick={data.callback}>
            <i className="poi_panel__back icon-arrow-left" />
            <span className="poi_panel__back_text">{data.text}</span>
            {pagesjaunes}
          </div>
        }
        {(!data.text || !data.callback) && pagesjaunes &&
          <div className="poi_panel__pj_logo_container">{pagesjaunes}</div>
        }
        <div className="poi_panel__close" onClick={this.closeAction}>
          <i className="icon-x" />
        </div>
      </div>
      <div className={classnames('poi_panel', { 'poi_panel--card': this.state.card })}>
        <div className="poi_panel__content__card">
          { this.props.isFromCategory &&
            <div className="poi_panel__close"
              onClick={ this.props.isFromCategory ? this.backToList : this.closeAction }>
              <i className="icon-x" />
            </div>
          }
          <div className="poi_panel__description_container">
            <div>
              <PoiHeader poi={this.poi} />
              <OpeningHour poi={this.poi} />
            </div>
            <PoiTitleImage poi={this.poi} iconOnly={true} />
          </div>
          <div className="poi_panel__content__card__action__container">
            { this.isDirectionActive &&
              <button
                className="poi_panel__content__card__action poi_panel__content__card__action__direction"
                onClick={this.openDirection}
              >
                <span className="icon-corner-up-right" />
                { _('DIRECTIONS', 'poi panel') }
              </button>
            }
            <button className="poi_panel__content__card__action" onClick={this.showDetail}>
              <span className="icon-chevrons-right" />
              { _('SEE MORE', 'poi panel') }
            </button>
          </div>
        </div>
        <div className="poi_panel__content">
          <div className="poi_panel__container">
            <div className="poi_panel__description_container" onClick={this.center}>
               <PoiHeader poi={this.poi} />
               <PoiTitleImage poi={this.poi} iconOnly={false} />
            </div>
            <div className="poi_panel__actions">
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
              {this.isDirectionActive &&
                <button className="poi_panel__action icon-corner-up-right"
                  onClick={this.openDirection}>
                  <div>{_('DIRECTIONS', 'poi')}</div>
                </button>
              }
              {this.poi.blocksByType && this.poi.blocksByType.phone &&
                this.renderPhone()}
            </div>
            {this.poi && this.poi.id.match(/latlon:/) && this.categories &&
              <div className="service_panel__categories--poi">
                <h3 className="service_panel__categories_title">
                  <span className="icon-icon_compass" />{_("Search around this place", "poi")}
                </h3>
                {this.categories.map((category, index) => {
                  return <button className="service_panel__category"
                    type="button"
                    onClick={() => this.openCategory(category)}
                  >
                    <div className="service_panel__category__icon"
                      style={{'background':category.backgroundColor}}
                    >
                      <span className={classnames('icon', `icon-${category.iconName}`)} />
                    </div>
                    <div className="service_panel__category__title">{category.label}</div>
                  </button>
                })}
              </div>
            }
            <PoiBlockContainer poi={this.poi} />
            {this.poi.isFromOSM && this.poi.isFromOSM() &&
              <OsmContribution poi={this.poi} />}
          </div>
        </div>
      </div>
    </div>;
  }
}
