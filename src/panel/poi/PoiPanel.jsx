/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Telemetry from 'src/libs/telemetry';
import nconf from '@qwant/nconf-getter';
import PoiCard from './PoiCard';
import ActionButtons from './ActionButtons';
import PoiHeader from './PoiHeader';
import PoiTitleImage from './PoiTitleImage';
import PoiBlockContainer from './PoiBlockContainer';
import Panel from 'src/components/ui/Panel';
import OsmContribution from 'src/components/OsmContribution';
import CategoryList from 'src/components/CategoryList';
import { openShareModal } from 'src/modals/ShareModal';
import { toAbsoluteUrl, isFromPagesJaunes, isFromOSM } from 'src/libs/pois';
import { buildQueryString } from 'src/libs/url_utils';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import Poi from 'src/adapters/poi/poi.js';
import SearchInput from 'src/ui_components/search_input';
import { DeviceContext } from 'src/libs/device';
import { fire, listen, unListen } from 'src/libs/customEvents';
import Store from '../../adapters/store';
import { openAndWaitForClose as openMasqFavModalAndWaitForClose }
  from 'src/modals/MasqFavoriteModal';

const covid19Enabled = (nconf.get().covid19 || {}).enabled;

const store = new Store();

async function isPoiFavorite(poi) {
  try {
    const storePoi = await store.has(poi);
    return !!storePoi;
  } catch (e) {
    return false;
  }
}

export default class PoiPanel extends React.Component {
  static propTypes = {
    poiId: PropTypes.string.isRequired,
    poi: PropTypes.object,
    poiFilters: PropTypes.object,
    centerMap: PropTypes.bool,
  }

  static defaultProps = {
    poiFilters: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      fullPoi: null,
      isPoiInFavorite: false,
      isPhoneNumberVisible: false,
    };
    this.isDirectionActive = nconf.get().direction.enabled;
    this.isMasqEnabled = nconf.get().masq.enabled;
  }

  componentDidMount() {
    fire('mobile_direction_button_visibility', false);
    this.loadPoi();
    this.storeAddHandler = listen('poi_added_to_favs', poi => {
      if (poi === this.state.fullPoi) {
        this.setState({ isPoiInFavorite: true });
      }
    });

    this.storeRemoveHandler = listen('poi_removed_from_favs', poi => {
      if (poi === this.state.fullPoi) {
        this.setState({ isPoiInFavorite: false });
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.poiId !== prevProps.poiId) {
      this.loadPoi();
    }
  }

  componentWillUnmount() {
    unListen(this.storeAddHandler);
    unListen(this.storeRemoveHandler);
    fire('move_mobile_bottom_ui', 0);
    fire('clean_marker');
    fire('mobile_direction_button_visibility', true);
    SearchInput.setInputValue('');
  }

  loadPoi = async () => {
    const { poiId, centerMap, poiFilters } = this.props;
    const mapOptions = { centerMap, poiFilters };

    // If a POI object is provided before fetching full data,
    // we can update the map immediately for UX responsiveness
    const shallowPoi = this.props.poi && Poi.deserialize(this.props.poi);
    const updateMapEarly = !!shallowPoi;
    if (updateMapEarly) {
      this._updateMapPoi(shallowPoi, mapOptions);
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
        isPhoneNumberVisible: !isFromPagesJaunes(poi),
      });
      isPoiFavorite(poi).then(isPoiInFavorite => {
        this.setState({ isPoiInFavorite });
      });
      if (!updateMapEarly) {
        this._updateMapPoi(poi, mapOptions);
      }
    }
  }

  _updateMapPoi(poi, options = {}) {
    window.execOnMapLoaded(function() {
      fire('map_mark_poi', poi, options);
    });
  }

  backToFavorite = () => {
    Telemetry.add(Telemetry.POI_BACKTOFAVORITE);
    window.app.navigateTo('/favs');
  }

  showDetails = () => {
    const poi = this.getBestPoi();
    Telemetry.add(Telemetry.POI_SEE_MORE, null, null,
      Telemetry.buildInteractionData({
        id: poi.id,
        source: poi.meta && poi.meta.source,
        template: 'single',
        zone: 'detail',
        element: 'more',
      })
    );
    this.setState({ showDetails: true });
  }

  getBestPoi() {
    return this.state.fullPoi || this.props.poi;
  }

  center = () => {
    const poi = this.getBestPoi();
    Telemetry.add('go', 'poi', poi.meta && poi.meta.source);
    fire('fit_map', poi);
  }

  openShare = () => {
    const poi = this.getBestPoi();
    Telemetry.add('share', 'poi', poi.meta && poi.meta.source);
    openShareModal(toAbsoluteUrl(poi));
  }

  openDirection = () => {
    window.app.navigateTo('/routes/', { poi: this.getBestPoi() });
  }

  closeAction = () => {
    window.app.navigateTo('/');
  }

  backToList = () => {
    const { poiFilters } = this.props;
    const queryObject = {};
    const mappingParams = {
      query: 'q',
      category: 'type',
    };

    for (const name in poiFilters) {
      if (!poiFilters[name]) {
        continue;
      }
      const key = mappingParams[name];
      queryObject[key || name] = poiFilters[name];
    }

    const params = buildQueryString(queryObject);
    const uri = `/places/${params}`;

    Telemetry.add(Telemetry.POI_BACKTOLIST);
    fire('restore_location');
    window.app.navigateTo(uri);
  }

  backToSmall = () => {
    this.setState({ showDetails: false });
  }

  showPhoneNumber = () => {
    const poi = this.getBestPoi();
    const source = poi.meta && poi.meta.source;
    if (source) {
      Telemetry.add('phone', 'poi', source,
        Telemetry.buildInteractionData({
          id: poi.id,
          source,
          template: 'single',
          zone: 'detail',
          element: 'phone',
        })
      );
    }
    this.setState({ isPhoneNumberVisible: true });
  }

  toggleStorePoi = async () => {
    const poi = this.state.fullPoi;
    if (poi.meta && poi.meta.source) {
      Telemetry.add('favorite', 'poi', poi.meta.source);
    }
    if (this.state.isPoiInFavorite) {
      store.del(poi);
    } else {
      if (this.isMasqEnabled) {
        const isLoggedIn = await store.isLoggedIn();
        if (!isLoggedIn) {
          await openMasqFavModalAndWaitForClose();
        }
      }
      store.add(poi);
    }
  }


  renderFull = poi => {
    const { poiFilters, isFromFavorite } = this.props;

    let backAction = null;
    if (isFromFavorite) {
      backAction = {
        callback: this.backToFavorite,
        text: _('Back to favorite'),
        className: 'poi_panel__back_to_list',
      };
    } else if (poiFilters.category || poiFilters.query) {
      backAction = {
        callback: this.backToList,
        text: _('Back to list'),
        className: 'poi_panel__back_to_list',
      };
    } else {
      backAction = {
        callback: this.backToSmall,
        text: _('Back'),
        className: 'poi_panel__back_mobile',
      };
    }

    const header = <div className="poi_panel__header">
      {backAction &&
        <div className={backAction.className} onClick={backAction.callback}>
          <i className="poi_panel__back icon-arrow-left" />
          <span className="poi_panel__back_text">{backAction.text}</span>
        </div>
      }
      {isFromPagesJaunes(poi) && <img className="poi_panel__pj_logo"
        src="./statics/images/pagesjaunes.svg"
        alt="PagesJaunes" />
      }
    </div>;

    return <Panel
      title={header}
      close={this.closeAction}
      className={classnames('poi_panel', {
        'poi_panel--empty-header':
          !isFromPagesJaunes(poi) &&
          !isFromFavorite &&
          (!poiFilters || !poiFilters.category),
      } )}
      initialSize="maximized"
    >
      <div className="poi_panel__content">
        <div className="poi_panel__description_container" onClick={this.center}>
          <PoiHeader poi={poi} />
          <PoiTitleImage poi={poi} iconOnly={false} />
        </div>
        <ActionButtons
          poi={poi}
          isDirectionActive={this.isDirectionActive}
          openDirection={this.openDirection}
          openShare={this.openShare}
          isPhoneNumberVisible={this.state.isPhoneNumberVisible}
          showPhoneNumber={this.showPhoneNumber}
          isPoiInFavorite={this.state.isPoiInFavorite}
          toggleStorePoi={this.toggleStorePoi}
        />
        <PoiBlockContainer poi={poi} covid19Enabled={covid19Enabled} />
        {poi.id.match(/latlon:/) && <div className="service_panel__categories--poi">
          <h3 className="service_panel__categories_title">
            <span className="icon-icon_compass" />{_('Search around this place', 'poi')}
          </h3>
          <CategoryList />
        </div>}
        {isFromOSM(poi) && <OsmContribution poi={poi} />}
      </div>
    </Panel>;
  }

  render() {
    const poi = this.getBestPoi();
    if (!poi) {
      // @TODO: we could implement a loading indicator instead
      return null;
    }

    return <DeviceContext.Consumer>
      {isMobile => {
        if (isMobile && !this.state.showDetails) {
          return <PoiCard
            poi={poi}
            closeAction={this.closeAction}
            openDirection={this.isDirectionActive && this.openDirection}
            showDetails={this.showDetails}
            covid19Enabled={covid19Enabled}
          />;
        }
        return this.renderFull(poi);
      }}
    </DeviceContext.Consumer>;
  }
}
