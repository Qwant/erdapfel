import React from 'react';
import PropTypes from 'prop-types';
import SearchInput from '../ui_components/search_input';
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
import Suggest from 'src/components/ui/Suggest';

const directionConf = nconf.get().direction;

export default class PanelManager extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    searchBarInputNode: PropTypes.object.isRequired,
    searchBarOutputNode: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ActivePanel: ServicePanel,
      options: {},
      panelSize: 'default',
      isSuggestOpen: false,
      searchQuery: '',
    };
  }

  componentDidMount() {
    const initialUrlPathName = window.location.pathname;
    const initialQueryParams = parseQueryString(window.location.search);
    this.initRouter();
    this.initTopBar();

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

      // Handle top bar's return button
      this.updateTopBarReturnButton(options);
    }
  }

  updateSearchBarContent({ poiFilters = {}, poi = {}, query } = {}) {
    const topBarHandle = document.querySelector('.top_bar');
    if (poi.name) {
      SearchInput.setInputValue(poi.name);
      topBarHandle.classList.add('top_bar--search_filled');
    } else if (poiFilters.category) {
      const categoryLabel = CategoryService.getCategoryByName(poiFilters.category)?.getInputValue();
      SearchInput.setInputValue(categoryLabel);
      topBarHandle.classList.add('top_bar--search_filled');
    } else if (poiFilters.query) {
      SearchInput.setInputValue(poiFilters.query);
      topBarHandle.classList.add('top_bar--search_filled');
    } else if (query) {
      SearchInput.setInputValue(query);
      topBarHandle.classList.add('top_bar--search_filled');
    } else {
      SearchInput.setInputValue('');
      topBarHandle.classList.remove('top_bar--search_filled');
    }
  }

  updateTopBarReturnButton({ poiFilters = {}, isFromFavorite, poi = {} } = {}) {
    const topBarHandle = document.querySelector('.top_bar');
    const topBarReturnButton = document.querySelector('.search_form__return');
    if (poi.name && (poiFilters.category || poiFilters.query || isFromFavorite)) {
      const backAction =
        poiFilters.category || poiFilters.query ? this.backToList : this.backToFavorite;
      // use the mousedown event so it's triggered before the blur event on the suggest
      topBarReturnButton.onmousedown = e => {
        if (this.state.isSuggestOpen) {
          return;
        }
        backAction(e, poiFilters);
      };
      topBarHandle.classList.add('top_bar--poi-from-list');
    } else {
      topBarReturnButton.removeAttribute('onmousedown');
      topBarHandle.classList.remove('top_bar--poi-from-list');
    }
  }

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

    router.addRoute('noresult', '/noresult', (_, options) => {
      this.setState({
        ActivePanel: NoResultPanel,
        panelSize: 'default',
        options: { ...options },
      });
    });

    router.addRoute('POI', '/place/([^?]+)', async (poiUrl, options = {}) => {
      const poiId = poiUrl.split('@')[0];
      this.setState({
        ActivePanel: PoiPanel,
        options: {
          ...options,
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
        SearchInput.select();
      }
    });

    // Route the initial URL
    return router.routeUrl(getCurrentUrl(), window.history.state || {});
  }

  initTopBar() {
    const searchInput = document.querySelector('#search');
    const topBarHandle = document.querySelector('.top_bar');

    searchInput.addEventListener('focus', () => {
      topBarHandle.classList.add('top_bar--search_focus');
    });

    searchInput.addEventListener('blur', () => {
      topBarHandle.classList.remove('top_bar--search_focus');
    });

    searchInput.addEventListener('input', () => {
      const value = searchInput.value;
      if (value.length > 0) {
        topBarHandle.classList.add('top_bar--search_filled');
      } else {
        topBarHandle.classList.remove('top_bar--search_filled');
      }
    });
  }

  setPanelSize = panelSize => {
    this.setState({ panelSize });
  };

  setSuggestOpen = isOpen => {
    if (this.state.isSuggestOpen !== isOpen) {
      this.setState({ isSuggestOpen: isOpen });
    }
  };

  setSearchQuery = searchQuery => {
    this.setState({ searchQuery });
  };

  render() {
    const { ActivePanel, options, panelSize, isSuggestOpen, searchQuery } = this.state;
    const { searchBarInputNode, searchBarOutputNode } = this.props;

    const isPanelVisible = !isSuggestOpen || (ActivePanel === ServicePanel && searchQuery === '');

    return (
      <div>
        <Suggest
          inputNode={searchBarInputNode}
          outputNode={searchBarOutputNode}
          withCategories
          onChange={this.setSearchQuery}
          onOpen={() => this.setSuggestOpen(true)}
          onClose={() => this.setSuggestOpen(false)}
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
