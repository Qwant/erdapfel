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
import { parseQueryString, getCurrentUrl } from 'src/libs/url_utils';
import { fire, listen } from 'src/libs/customEvents';
import { isNullOrEmpty } from 'src/libs/object';
import { isMobileDevice } from 'src/libs/device';
import { PanelContext } from 'src/libs/panelContext.js';
import NoResultPanel from 'src/panel/NoResultPanel';

const directionConf = nconf.get().direction;

const directSearchRouteName = 'Direct search query';

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
    };
  }

  componentDidMount() {
    const initialUrlPathName = window.location.pathname;
    const initialQueryParams = parseQueryString(window.location.search);
    const initialRoute = this.initRouter();
    this.initTopBar();

    Telemetry.add(Telemetry.APP_START, null, null, {
      'language': window.getLang(),
      'is_mobile': isMobileDevice(),
      'url_pathname': initialUrlPathName,
      'direct_search': initialRoute.name === directSearchRouteName && !!initialQueryParams['q'],
      'url_client': initialQueryParams['client'] || null,
    });

    window.times.appRendered = Date.now();

    listen('map_user_interaction', () => {
      if (this.state.ActivePanel === PoiPanel) {
        this.setState({ panelSize: 'minimized'});
      }
    });
  }

  componentDidUpdate(_prevProps, prevState) {
    const { ActivePanel, options } = this.state;

    if (prevState.ActivePanel !== ActivePanel || prevState.options !== options) {
      // poiFilters indicate we are in a "list of POI" context, where markers should be persistent
      if (isNullOrEmpty(options?.poiFilters)) {
        fire('remove_category_markers');
      }
    }

    this.updateSearchBarContent(options);
  }

  updateSearchBarContent({ poiFilters = {}, query }) {
    const topBarHandle = document.querySelector('.top_bar');
    if (poiFilters.category) {
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

    router.addRoute('POI', '/place/(.*)', async (poiUrl, options = {}) => {
      const poiId = poiUrl.split('@')[0];
      this.setState({
        ActivePanel: PoiPanel,
        options: { ...options, poiId },
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
        (directionConf.publicTransport && directionConf.publicTransport.enabled)
        || parseQueryString(document.location.search)['pt'] === 'true';

      router.addRoute('Routes', '/routes(?:/?)(.*)', (routeParams, options) => {
        this.setState({
          ActivePanel: DirectionPanel,
          options: { ...parseQueryString(routeParams), ...options, isPublicTransportActive },
          panelSize: 'default',
        });
      });
    }

    router.addRoute(directSearchRouteName, '/([?].*)', queryString => {
      const params = parseQueryString(queryString);
      if (params.q) {
        SearchInput.executeSearch(params.q, { fromQueryParams: params });
      } else {
        router.routeUrl('/');
      }
    });

    // Default matching route
    router.addRoute('Services', '/?', (_, options) => {
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
  }

  render() {
    const { ActivePanel, options, panelSize } = this.state;

    return <PanelContext.Provider value={{ size: panelSize, setSize: this.setPanelSize }} >
      <div className="panel_container">
        <ActivePanel {...options} />
      </div>
    </PanelContext.Provider>;
  }
}
