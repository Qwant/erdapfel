/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Telemetry from 'src/libs/telemetry';
import nconf from '@qwant/nconf-getter';
import ActionButtons from './ActionButtons';
import PoiBlockContainer from './PoiBlockContainer';
import Panel from 'src/components/ui/Panel';
import OsmContribution from 'src/components/OsmContribution';
import CategoryList from 'src/components/CategoryList';
import { isFromPagesJaunes, isFromOSM } from 'src/libs/pois';
import { buildQueryString } from 'src/libs/url_utils';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import Poi from 'src/adapters/poi/poi.js';
import SearchInput from 'src/ui_components/search_input';
import { fire, listen, unListen } from 'src/libs/customEvents';
import Store from '../../adapters/store';
import { openAndWaitForClose as openMasqFavModalAndWaitForClose }
  from 'src/modals/MasqFavoriteModal';
// import PoiItem from 'src/components/PoiItem';
import { isNullOrEmpty } from 'src/libs/object';

import { capitalizeFirst } from 'src/libs/string';
import poiSubClass from 'src/mapbox/poi_subclass';
import ReviewScore from 'src/components/ReviewScore';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';

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
      fullPoi: null,
      isPoiInFavorite: false,
    };
    this.isDirectionActive = nconf.get().direction.enabled;
    this.isMasqEnabled = nconf.get().masq.enabled;
  }

  componentDidMount() {
    fire('mobile_direction_button_visibility', false);

    // Load poi or pois
    !this.props.pois ? this.loadPoi() : this.loadPois();

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

  loadPois = () => {
    const { poi, centerMap } = this.props;
    window.execOnMapLoaded(() => {
      fire('add_category_markers', this.props.pois, this.props.poiFilters);
    });
    this.updateMapPoi(poi, { centerMap });
  }

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
      });
      isPoiFavorite(poi).then(isPoiInFavorite => {
        this.setState({ isPoiInFavorite });
      });
      if (!updateMapEarly) {
        this.updateMapPoi(poi, mapOptions);
      }
    }
  }

  updateMapPoi(poi, options = {}) {
    window.execOnMapLoaded(() => {
      if (isNullOrEmpty(this.props.poiFilters)) {
        fire('create_poi_marker', poi);
      } else {
        fire('highlight_category_marker', poi, true);
      }
      fire('ensure_poi_visible', poi, options);
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

  onClickPhoneNumber = () => {
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
    const { name, localName, subClassName } = poi;
    const title = name || localName;
    const reviews = poi.blocksByType?.grades;
    // const alternative = (withAlternativeName && name && localName && localName !== name) && localName;
    const subclass = capitalizeFirst(poiSubClass(subClassName));

    let backAction = null;
    if (isFromFavorite) {
      backAction = {
        callback: this.backToFavorite,
        text: _('Back to favorites'),
        className: 'poi_panel__back_to_list',
      };
    } else if (poiFilters.category || poiFilters.query) {
      backAction = {
        callback: this.backToList,
        text: _('Back to list'),
        className: 'poi_panel__back_to_list',
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

    const OpenStatus = () =>
      poi?.blocksByType?.opening_hours
        ? <OpeningHour
          schedule={new OsmSchedule(poi.blocksByType.opening_hours)}
          className="u-text--label"
        />
        : null;

    return <Panel
      defaultHeight={240}
      minimizedHeight={100}
      title={header}
      resizable
      close={this.closeAction}
      className={classnames('poi_panel', {
        'poi_panel--empty-header':
          !isFromPagesJaunes(poi) &&
          !isFromFavorite &&
          (!poiFilters || !poiFilters.category),
      } )}
      // initialSize="maximized"
    >
      <div className="poi_panel__content">

        {/* Basic info */}
        <div style={{ marginBottom: 20 }}>
          <h2 className="poiTitle u-text--title">{title || subclass}</h2>
          {reviews &&
            <ReviewScore className="poi_panel-reviews" reviews={reviews} poi={poi} inList />
          }
          <div className="poiTitle-subclass u-text--subtitle">{subclass}</div>
          <OpenStatus />
        </div>

        {/* Actions buttons */}
        <ActionButtons
          poi={poi}
          isDirectionActive={this.isDirectionActive}
          openDirection={this.openDirection}
          onClickPhoneNumber={this.onClickPhoneNumber}
          isPoiInFavorite={this.state.isPoiInFavorite}
          toggleStorePoi={this.toggleStorePoi}
        />

        {/* About */}
        <PoiBlockContainer poi={poi} covid19Enabled={covid19Enabled} />

        {poi.id.match(/latlon:/) && <div className="service_panel__categories--poi">
          <h3 className="service_panel__categories_title">
            <span className="icon-icon_compass" />{_('Search around this place', 'poi')}
          </h3>
          <CategoryList />
        </div>}

        {/* OSM contribution info */}
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

    return this.renderFull(poi);
  }
}
