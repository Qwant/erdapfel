import React from 'react';
import PropTypes from 'prop-types';
import nconf from '@qwant/nconf-getter';
import FavoritesPanel from './favorites/FavoritesPanel';
import PoiPanel from './poi/PoiPanel';
import ServicePanel from './service/ServicePanel';
import CategoryPanel from 'src/panel/category/CategoryPanel';
import DirectionPanel from 'src/panel/direction/DirectionPanel';
import Telemetry from 'src/libs/telemetry';
import CategoryService from 'src/adapters/category_service';
import { parseQueryString, getCurrentUrl, buildQueryString } from 'src/libs/url_utils';
import { fire, listen } from 'src/libs/customEvents';
import { isNullOrEmpty } from 'src/libs/object';
import { isMobileDevice } from 'src/libs/device';
import { PanelContext } from 'src/libs/panelContext.js';
import NoResultPanel from 'src/panel/NoResultPanel';
import TopBar from 'src/components/TopBar';

const directionConf = nconf.get().direction;

export default class PanelManager extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ActivePanel: ServicePanel,
      options: {},
      panelSize: 'default',
      isSuggestOpen: false,
      appInputValue: '',
      userInputValue: '',
    };

    this.mainSearchInputRef = React.createRef();
  }

  componentDidMount() {
    const initialUrlPathName = window.location.pathname;
    const initialQueryParams = parseQueryString(window.location.search);
    this.initRouter();

    Telemetry.add(Telemetry.APP_START, {
      language: window.getLang(),
      is_mobile: isMobileDevice(),
      url_pathname: initialUrlPathName,
      url_client: initialQueryParams['client'] || null,
    });

    window.times.appRendered = Date.now();

    listen('map_user_interaction', () => {
      if (isMobileDevice() && this.state.panelSize !== 'minimized') {
        this.setState({ panelSize: 'minimized' });
      }
      fire('restart_idle_timeout');
    });
  }

  componentDidUpdate(_prevProps, prevState) {
    const { ActivePanel, options } = this.state;

    if (prevState.ActivePanel !== ActivePanel || prevState.options !== options) {
      // Not in a "list of PoI" context (options.poiFilters is null)
      if (isNullOrEmpty(options?.poiFilters)) {
        // Markers are not persistent
        fire('remove_category_markers');
      }

      // Handle search bar's style and text content
      this.updateSearchBarContent(options);
    }
  }

  updateSearchBarContent({ poiFilters = {}, poi = {}, query } = {}) {
    let appInputValue = '';
    if (poi.name) {
      appInputValue = poi.name;
    } else if (poiFilters.category) {
      const categoryLabel = CategoryService.getCategoryByName(poiFilters.category)?.getInputValue();
      appInputValue = categoryLabel;
    } else if (poiFilters.query) {
      appInputValue = poiFilters.query;
    } else if (query) {
      appInputValue = query;
    } else {
      appInputValue = '';
    }
    this.setState({ appInputValue, userInputValue: '' });
  }

  setUserInputValue = value => {
    this.setState({ userInputValue: value, appInputValue: '' });
  };

  backToList(e, poiFilters) {
    e.stopPropagation();
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

  backToFavorite(e) {
    e.stopPropagation();
    Telemetry.add(Telemetry.POI_BACKTOFAVORITE);
    window.app.navigateTo('/favs');
  }

  initRouter() {
    const router = this.props.router;

    router.addRoute('Category', '/places/(.*)', placesParams => {
      const { type: category, q: query, ...otherOptions } = parseQueryString(placesParams);
      this.setState({
        ActivePanel: CategoryPanel,
        options: {
          poiFilters: {
            category,
            query,
          },
          ...otherOptions,
        },
        panelSize: 'default',
      });
    });

    router.addRoute('noresult', '/noresult(?:/?)(.*)', (routeParams, options) => {
      const { q: query } = parseQueryString(routeParams);
      this.setState({
        ActivePanel: NoResultPanel,
        panelSize: 'default',
        options: {
          ...options,
          query,
          resetInput: () => {
            this.setState({ appInputValue: '' });
            this.mainSearchInputRef.current.select();
          },
        },
      });
    });

    router.addRoute('POI', '/place/(.*)', async (urlPart, options = {}) => {
      const [poi, params] = urlPart.split('?');
      const { q: query } = parseQueryString(params);
      const poiId = poi.split('@')[0];
      this.setState({
        ActivePanel: PoiPanel,
        options: {
          ...options,
          query,
          poiId,
          backToList: this.backToList,
          backToFavorite: this.backToFavorite,
        },
        panelSize: 'default',
      });
    });

    router.addRoute('Favorites', '/favs', () => {
      this.setState({
        ActivePanel: FavoritesPanel,
        options: {},
        panelSize: 'default',
      });
    });

    if (directionConf.enabled) {
      const isPublicTransportActive =
        (directionConf.publicTransport && directionConf.publicTransport.enabled) ||
        parseQueryString(document.location.search)['pt'] === 'true';

      router.addRoute('Routes', '/routes(?:/?)(.*)', (routeParams, options) => {
        const params = parseQueryString(routeParams);
        params.details = params.details === 'true';
        params.activeRouteId = Number(params.selected) || 0;
        this.setState({
          ActivePanel: DirectionPanel,
          options: { ...params, ...options, isPublicTransportActive },
          panelSize: 'default',
        });
      });
    }

    // Default matching route
    router.addRoute('Services', '/?', (_, options = {}) => {
      this.setState({
        ActivePanel: ServicePanel,
        options,
        panelSize: 'default',
      });
      if (options?.focusSearch) {
        this.mainSearchInputRef.current.select();
      }
    });

    // Route the initial URL
    return router.routeUrl(getCurrentUrl(), window.history.state || {});
  }

  setPanelSize = panelSize => {
    this.setState({ panelSize });
  };

  setSuggestOpen = isOpen => {
    if (this.state.isSuggestOpen !== isOpen) {
      this.setState({ isSuggestOpen: isOpen });
    }
  };

  getTopBarReturnAction = () => {
    const { poi, poiFilters = {}, isFromFavorite } = this.state.options;
    if (poi?.name && (poiFilters?.category || poiFilters?.query || isFromFavorite)) {
      const backAction =
        poiFilters.category || poiFilters.query ? this.backToList : this.backToFavorite;
      // use the mousedown event so it's triggered before the blur event on the suggest
      return event => {
        if (this.state.isSuggestOpen) {
          return;
        }
        backAction(event, poiFilters);
      };
    }
    return null;
  };

  render() {
    const {
      ActivePanel,
      options,
      panelSize,
      isSuggestOpen,
      appInputValue,
      userInputValue,
    } = this.state;

    const isPanelVisible = !isSuggestOpen || (ActivePanel === ServicePanel && !userInputValue);

    return (
      <div>
        <TopBar
          value={appInputValue || userInputValue}
          setUserInputValue={this.setUserInputValue}
          ref={this.mainSearchInputRef}
          onSuggestToggle={this.setSuggestOpen}
          backButtonAction={this.getTopBarReturnAction()}
        />
        <PanelContext.Provider value={{ size: panelSize, setSize: this.setPanelSize }}>
          {/*
            The panel container is made hidden using "display: none;" to avoid unnecessary
            mounts and unmounts of the ActivePanel, that would have inappropriate side effects
            on map markers, requests to server, etc.
          */}
          <div className="panel_container" style={{ display: !isPanelVisible ? 'none' : null }}>
            <ActivePanel {...options} />
          </div>
        </PanelContext.Provider>
      </div>
    );
  }
}
