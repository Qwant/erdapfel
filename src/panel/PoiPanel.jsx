/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Telemetry from '../libs/telemetry';
import nconf from '@qwant/nconf-getter';
import layouts from './layouts.js';

import ActionButtons from 'src/panel/poi/ActionButtons';
import PoiHeader from 'src/panel/poi/PoiHeader';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import OpeningHour from 'src/components/OpeningHour';
import OsmContribution from 'src/components/OsmContribution';
import PoiBlockContainer from './poi_bloc/PoiBlockContainer';

import CategoryService from '../adapters/category_service';
import { openShareModal } from 'src/modals/ShareModal';

import PoiStore from '../adapters/poi/poi_store';

export default class PoiPanel extends React.Component {
  static propTypes = {
    poi: PropTypes.object.isRequired,
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
    };
    this.categories = CategoryService.getCategories();
    this.isDirectionActive = nconf.get().direction.enabled;
    this.isMasqEnabled = nconf.get().masq.enabled;

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
    Telemetry.add(Telemetry.POI_BACKTOFAVORITE);
    window.app.navigateTo('/favs');
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

  openShare = () => {
    if (this.poi.meta && this.poi.meta.source) {
      Telemetry.add('share', 'poi', this.poi.meta.source);
    }
    if (this.poi) {
      openShareModal(this.poi.toAbsoluteUrl());
    }
  }

  closeAction = () => {
    window.app.navigateTo('/');
  }

  openCategory = category => {
    window.app.navigateTo(`/places/?type=${category.name}`);
  }

  backToList = () => {
    Telemetry.add(Telemetry.POI_BACKTOLIST);
    fire('restore_location');
    window.app.navigateTo(`/places/?type=${this.props.sourceCategory}`);
  }

  backToSmall = () => {
    this.setState({
      card: true,
    });
  }

  render() {
    if (!this.poi) {
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
    }
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
                className={
                  'poi_panel__content__card__action poi_panel__content__card__action__direction'
                }
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
            <ActionButtons
              poi={this.props.poi}
              isFromCategory={this.props.isFromCategory}
              isFromFavorite={this.props.isFromFavorite}
              isDirectionActive={this.isDirectionActive}
            />
            {this.poi && this.poi.id.match(/latlon:/) && this.categories &&
              <div className="service_panel__categories--poi">
                <h3 className="service_panel__categories_title">
                  <span className="icon-icon_compass" />{_('Search around this place', 'poi')}
                </h3>
                {this.categories.map((category, index) => {
                  return <button className="service_panel__category"
                    key={index}
                    type="button"
                    onClick={() => this.openCategory(category)}
                  >
                    <div className="service_panel__category__icon"
                      style={{ 'background': category.backgroundColor }}
                    >
                      <span className={classnames('icon', `icon-${category.iconName}`)} />
                    </div>
                    <div className="service_panel__category__title">{category.label}</div>
                  </button>;
                })}
              </div>
            }
            <PoiBlockContainer poi={this.poi} />
            {this.poi.isFromOSM && this.poi.isFromOSM() && <OsmContribution poi={this.poi} />}
          </div>
        </div>
      </div>
    </div>;
  }
}
