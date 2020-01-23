/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Telemetry from 'src/libs/telemetry';
import nconf from '@qwant/nconf-getter';
import layouts from 'src/panel/layouts.js';
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
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import Poi from 'src/adapters/poi/poi.js';
import SearchInput from 'src/ui_components/search_input';
import Device from 'src/libs/device';

export default class PoiPanel extends React.Component {
  static propTypes = {
    poiId: PropTypes.string.isRequired,
    poi: PropTypes.object,
    isFromFavorite: PropTypes.bool,
    isFromCategory: PropTypes.bool,
    sourceCategory: PropTypes.string,
    centerMap: PropTypes.bool,
    layout: PropTypes.object,
  }

  static defaultProps = {
    layout: layouts.POI,
  };

  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      fullPoi: null,
    };
    this.isDirectionActive = nconf.get().direction.enabled;
    this.isMasqEnabled = nconf.get().masq.enabled;
  }

  componentDidMount() {
    this.loadPoi();
  }

  componentDidUpdate(prevProps) {
    if (this.props.poiId !== prevProps.poiId) {
      this.loadPoi();
    }
  }

  componentWillUnmount() {
    fire('move_mobile_bottom_ui', 0);
    fire('clean_marker');
    SearchInput.setInputValue('');
  }

  loadPoi = async () => {
    const { poiId, centerMap, isFromCategory, layout } = this.props;
    const mapOptions = { centerMap, isFromCategory, layout };

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
      this.setState({ fullPoi: poi });
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
    fire('fit_map', poi, layouts.POI);
  }

  openShare = () => {
    const poi = this.getBestPoi();
    Telemetry.add('share', 'poi', poi.meta && poi.meta.source);
    openShareModal(toAbsoluteUrl(poi));
  }

  openDirection = () => {
    window.app.navigateTo('/routes/', { poi: this.props.poi });
  }

  closeAction = () => {
    window.app.navigateTo('/');
  }

  backToList = () => {
    Telemetry.add(Telemetry.POI_BACKTOLIST);
    fire('restore_location');
    window.app.navigateTo(`/places/?type=${this.props.sourceCategory}`);
  }

  backToSmall = () => {
    this.setState({ showDetails: false });
  }

  render() {
    const poi = this.getBestPoi();
    if (!poi) {
      // @TODO: we could implement a loading indicator instead
      return null;
    }

    if (Device.isMobile() && !this.state.showDetails) {
      return <PoiCard
        poi={poi}
        closeAction={this.closeAction}
        openDirection={this.isDirectionActive && this.openDirection}
        showDetails={this.showDetails}
      />;
    }

    const { isFromCategory, isFromFavorite } = this.props;

    let backAction = null;
    if (isFromFavorite) {
      backAction = {
        callback: this.backToFavorite,
        text: _('Back to favorite'),
        className: 'poi_panel__back_to_list',
      };
    } else if (isFromCategory) {
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
        'poi_panel--empty-header': !isFromPagesJaunes(poi) && !isFromFavorite && !isFromCategory,
      } )}
      initialSize="maximized"
      white
    >
      <div className="poi_panel__content">
        <div className="poi_panel__description_container" onClick={this.center}>
          <PoiHeader poi={poi} />
          <PoiTitleImage poi={poi} iconOnly={false} />
        </div>
        <ActionButtons
          poi={poi}
          isFromCategory={isFromCategory}
          isFromFavorite={isFromFavorite}
          isDirectionActive={this.isDirectionActive}
          openDirection={this.openDirection}
          openShare={this.openShare}
          isMasqEnabled={this.isMasqEnabled}
        />
        <PoiBlockContainer poi={poi} />
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
}
