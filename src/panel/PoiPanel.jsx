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

export default class PoiPanel extends React.Component {
  static propTypes = {
    poi: PropTypes.object.isRequired,
    isFromFavorite: PropTypes.bool,
    isFromCategory: PropTypes.bool,
    sourceCategory: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
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

  backToFavorite = () => {
    Telemetry.add(Telemetry.POI_BACKTOFAVORITE);
    window.app.navigateTo('/favs');
  }

  showDetail = () => {
    if (this.props.poi.meta && this.props.poi.meta.source) {
      Telemetry.add(Telemetry.POI_SEE_MORE, null, null,
        Telemetry.buildInteractionData({
          id: this.props.poi.id,
          source: this.props.poi.meta.source,
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
    if (this.props.poi.meta && this.props.poi.meta.source) {
      Telemetry.add('go', 'poi', this.props.poi.meta.source);
    }
    fire('fit_map', this.props.poi, layouts.POI);
  }

  openShare = () => {
    if (this.props.poi.meta && this.props.poi.meta.source) {
      Telemetry.add('share', 'poi', this.props.poi.meta.source);
    }
    if (this.props.poi) {
      openShareModal(this.props.poi.toAbsoluteUrl());
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
    const { poi } = this.props;

    const data = {
      className: 'poi_panel__back_to_list',
    };
    const pagesjaunes = poi.isFromPagesjaunes && poi.isFromPagesjaunes() ?
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
              <PoiHeader poi={poi} />
              <OpeningHour poi={poi} />
            </div>
            <PoiTitleImage poi={poi} iconOnly={true} />
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
              <PoiHeader poi={poi} />
              <PoiTitleImage poi={poi} iconOnly={false} />
            </div>
            <ActionButtons
              poi={poi}
              isFromCategory={this.props.isFromCategory}
              isFromFavorite={this.props.isFromFavorite}
              isDirectionActive={this.isDirectionActive}
            />
            {poi && poi.id.match(/latlon:/) && this.categories &&
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
            <PoiBlockContainer poi={poi} />
            {poi.isFromOSM && poi.isFromOSM() && <OsmContribution poi={poi} />}
          </div>
        </div>
      </div>
    </div>;
  }
}
