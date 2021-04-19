/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Telemetry from 'src/libs/telemetry';
import nconf from '@qwant/nconf-getter';
import ActionButtons from './ActionButtons';
import PoiBlockContainer from './PoiBlockContainer';
import OsmContribution from 'src/components/OsmContribution';
import CategoryList from 'src/components/CategoryList';
import { isFromPagesJaunes, isFromOSM } from 'src/libs/pois';
import { buildQueryString, shouldShowBackToQwant } from 'src/libs/url_utils';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import Poi from 'src/adapters/poi/poi.js';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { addToFavorites, removeFromFavorites, isInFavorites } from 'src/adapters/store';
import PoiItem from 'src/components/PoiItem';
import { isNullOrEmpty } from 'src/libs/object';
import { DeviceContext } from 'src/libs/device';
import { Flex, Panel, PanelNav, Divider, Button } from 'src/components/ui';
import { BackToQwantButton } from 'src/components/BackToQwantButton';
import SearchInput from '../../ui_components/search_input';

const covid19Enabled = (nconf.get().covid19 || {}).enabled;

export default class PoiPanel extends React.Component {
  static propTypes = {
    poiId: PropTypes.string.isRequired,
    poi: PropTypes.object,
    poiFilters: PropTypes.object,
    centerMap: PropTypes.bool,
    backToList: PropTypes.func,
    backToFavorite: PropTypes.func,
  };

  static defaultProps = {
    poiFilters: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      fullPoi: null,
      isPoiInFavorite: false,
    };
    this.isDirectionActive = nconf.get().direction.enabled;
  }

  componentDidMount() {
    // direction shortcut will be visible in minimized state
    fire('mobile_direction_button_visibility', false);
    fire('set_direction_shortcut_callback', this.openDirection);

    // Load poi or pois
    !this.props.pois ? this.loadPoi() : this.loadPois();

    this.storePoiChangeHandler = listen('poi_favorite_state_changed', (poi, isPoiInFavorite) => {
      if (poi === this.state.fullPoi) {
        this.setState({ isPoiInFavorite });
      }
    });

    // Show return arrow on mobile if user comes from PoI / favorites list
    const { poiFilters, isFromFavorite } = this.props;
    if (poiFilters.category || poiFilters.query || isFromFavorite) {
      const topBarHandle = document.querySelector('.top_bar');
      topBarHandle.classList.add('top_bar--poi-from-list');
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.poiId !== prevProps.poiId) {
      this.loadPoi();
    }
  }

  componentWillUnmount() {
    unListen(this.storePoiChangeHandler);
    fire('move_mobile_bottom_ui', 0);
    fire('clean_marker');
    fire('mobile_direction_button_visibility', true);
    // Clear direction shortcut cb to reset default action
    fire('set_direction_shortcut_callback', null);

    // Hide return arrow on mobile
    const topBarHandle = document.querySelector('.top_bar');
    topBarHandle.classList.remove('top_bar--poi-from-list');
  }

  loadPois = () => {
    window.execOnMapLoaded(() => {
      fire('add_category_markers', this.props.pois, this.props.poiFilters);
    });
    this.loadPoi();
  };

  loadPoi = async () => {
    const { poiId, centerMap } = this.props;
    const mapOptions = { centerMap };

    // If a POI object is provided before fetching full data,
    // we can update the map immediately for UX responsiveness
    const shallowPoi = this.props.poi && Poi.deserialize(this.props.poi);
    const updateMapEarly = !!shallowPoi;
    if (updateMapEarly) {
      this.updateMapPoi(shallowPoi, mapOptions);
    }

    let poi;
    if (window.hotLoadPoi && window.hotLoadPoi.id === poiId) {
      Telemetry.add(Telemetry.POI_RESTORE);
      poi = new IdunnPoi(window.hotLoadPoi);
      mapOptions.centerMap = true;
    } else {
      poi = await IdunnPoi.poiApiLoad(this.props.poi || { id: poiId });
    }

    // fallback on the simple POI object from the map
    // if Idunn doesn't know this POI
    poi = poi || shallowPoi;

    if (!poi) {
      // @TODO: error message instead of close in case of unrecognized POI
      this.closeAction();
    } else {
      this.setState({
        fullPoi: poi,
        isPoiInFavorite: isInFavorites(poi),
      });
      if (!updateMapEarly) {
        this.updateMapPoi(poi, mapOptions);
      }
    }
  };

  updateMapPoi(poi, options = {}) {
    window.execOnMapLoaded(() => {
      if (isNullOrEmpty(this.props.poiFilters)) {
        fire('create_poi_marker', poi);
      } else {
        fire('click_category_marker', poi);
      }
      fire('ensure_poi_visible', poi, options);
    });
  }

  getBestPoi() {
    return this.state.fullPoi || this.props.poi;
  }

  center = () => {
    const poi = this.getBestPoi();
    Telemetry.sendPoiEvent(poi, 'go');
    fire('fit_map', poi);
  };

  openDirection = () => {
    const poi = this.getBestPoi();
    Telemetry.sendPoiEvent(poi, 'itinerary');
    window.app.navigateTo('/routes/', { poi });
  };

  closeAction = () => {
    window.app.navigateTo('/');
  };

  onClickPhoneNumber = () => {
    const poi = this.getBestPoi();
    const source = poi.meta && poi.meta.source;
    if (source) {
      Telemetry.sendPoiEvent(
        poi,
        'phone',
        Telemetry.buildInteractionData({
          id: poi.id,
          source,
          template: 'single',
          zone: 'detail',
          element: 'phone',
        })
      );
    }
  };

  toggleStorePoi = () => {
    const poi = this.state.fullPoi;
    Telemetry.sendPoiEvent(poi, 'favorite', { stored: !this.state.isPoiInFavorite });
    if (this.state.isPoiInFavorite) {
      removeFromFavorites(poi);
    } else {
      addToFavorites(poi);
    }
  };

  render() {
    const { poiFilters, isFromFavorite } = this.props;
    const poi = this.getBestPoi();

    if (!poi) {
      // @TODO: we could implement a loading indicator instead
      return null;
    }

    // Show PoI name in search field
    SearchInput.setInputValue(poi.name);
    const topBarHandle = document.querySelector('.top_bar');
    topBarHandle.classList.add('top_bar--search_filled');

    const backAction =
      poiFilters.category || poiFilters.query
        ? this.props.backToList
        : isFromFavorite
        ? this.props.backToFavorite
        : this.closeAction;

    const NavHeader = ({ isMobile }) => {
      if (isMobile) {
        return null;
      }

      if (shouldShowBackToQwant()) {
        return (
          <PanelNav>
            <BackToQwantButton />
          </PanelNav>
        );
      }

      // If source is a PoI list: show a button to return to the list
      if (backAction !== this.closeAction) {
        return (
          <PanelNav>
            <Button
              icon="arrow-left"
              variant="tertiary"
              onClick={e => {
                backAction(e, poiFilters);
              }}
            >
              {_('Display all results')}
            </Button>
          </PanelNav>
        );
      }

      return null;
    };

    return (
      <DeviceContext.Consumer>
        {({ isMobile }) => (
          <Panel
            resizable
            fitContent={['default', 'minimized']}
            className={classnames('poi_panel', {
              'poi_panel--empty-header':
                !isFromPagesJaunes(poi) && !isFromFavorite && (!poiFilters || !poiFilters.category),
            })}
            renderHeader={<NavHeader isMobile={isMobile} />}
            floatingItemsLeft={
              isMobile &&
              shouldShowBackToQwant() && [<BackToQwantButton key="back-to-qwant" isMobile />]
            }
          >
            <div className="poi_panel__content">
              <Flex alignItems="flex-start" justifyContent="space-between">
                <PoiItem
                  poi={poi}
                  className="u-mb-l poi-panel-poiItem"
                  withAlternativeName
                  withOpeningHours
                  onClick={this.center}
                />
              </Flex>
              <div className="u-mb-l">
                <ActionButtons
                  poi={poi}
                  isDirectionActive={this.isDirectionActive}
                  openDirection={this.openDirection}
                  onClickPhoneNumber={this.onClickPhoneNumber}
                  isPoiInFavorite={this.state.isPoiInFavorite}
                  toggleStorePoi={this.toggleStorePoi}
                />
              </div>
              <div className="poi_panel__fullContent">
                <PoiBlockContainer poi={poi} covid19Enabled={covid19Enabled} />
                {isFromPagesJaunes(poi) && (
                  <div className="poi_panel__info-partnership u-text--caption u-mb-s">
                    {_('In partnership with')}
                    <img src="./statics/images/pj.svg" alt="PagesJaunes" width="80" height="16" />
                  </div>
                )}
                {isFromOSM(poi) && <OsmContribution poi={poi} />}
                <Divider paddingTop={0} className="poi_panel__fullWidthDivider" />
                <h3 className="u-text--smallTitle u-mb-s">
                  {_('Search around this place', 'poi')}
                </h3>
                <CategoryList className="poi_panel__categories u-mb-s" limit={4} />
              </div>
            </div>
          </Panel>
        )}
      </DeviceContext.Consumer>
    );
  }
}
