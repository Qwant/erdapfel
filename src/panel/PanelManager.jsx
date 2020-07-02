import React from 'react';
import PropTypes from 'prop-types';
import SearchInput from '../ui_components/search_input';
import nconf from '@qwant/nconf-getter';
import FavoritesPanel from './favorites/FavoritesPanel';
import PoiPanel from './poi/PoiPanel';
import ServicePanel from './service/ServicePanel';
import CategoryPanel from 'src/panel/category/CategoryPanel';
import DirectionPanel from 'src/panel/direction/DirectionPanel';
import classnames from 'classnames';
import Telemetry from 'src/libs/telemetry';
import { parseQueryString, getCurrentUrl } from 'src/libs/url_utils';
import { fire } from 'src/libs/customEvents';
import { isNullOrEmpty } from 'src/libs/object';
import { isMobileDevice } from 'src/libs/device';

const performanceEnabled = nconf.get().performance.enabled;
const categoryEnabled = nconf.get().category.enabled;
const directionConf = nconf.get().direction;

const directSearchRouteName = 'Direct search query';

export default class PanelManager extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isMinified: false,
      ActivePanel: ServicePanel,
      options: {},
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

    if (performanceEnabled) {
      window.times.appRendered = Date.now();
    }
  }

  componentDidUpdate(_prevProps, prevState) {
    const { ActivePanel, options } = this.state;

    if (prevState.ActivePanel !== ActivePanel || prevState.options !== options) {
      // poiFilters indicate we are in a "list of POI" context, where markers should be persistent
      if (isNullOrEmpty(options?.poiFilters)) {
        fire('remove_category_markers');
        fire('remove_event_markers');
      }

      if (ActivePanel === DirectionPanel) {
        SearchInput.minify();
      } else {
        SearchInput.unminify();
        if (this.state.isMinified) {
          this.setState({ isMinified: false });
        }
      }
    }
  }

  initRouter() {
    const router = this.props.router;

    if (categoryEnabled) {
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
        });
      });
    }

    router.addRoute('POI', '/place/(.*)', async (poiUrl, options = {}) => {
      const poiId = poiUrl.split('@')[0];
      this.setState({
        ActivePanel: PoiPanel,
        options: { ...options, poiId },
      });
    });

    router.addRoute('Favorites', '/favs', () => {
      this.setState({
        ActivePanel: FavoritesPanel,
        options: {},
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
      this.setState({ ActivePanel: ServicePanel, options });
      if (options?.focusSearch) {
        SearchInput.select();
      }
    });

    // Route the initial URL
    return router.routeUrl(getCurrentUrl(), window.history.state || {});
  }

  toggleMinify = () => {
    if (this.state.isMinified) {
      SearchInput.unminify();
      this.setState({ isMinified: false });
    } else {
      if (this.state.ActivePanel === DirectionPanel && SearchInput.isMinified()) {
        SearchInput.unminify();
        return;
      }
      SearchInput.minify();
      this.setState({ isMinified: true });
    }
  }

  initTopBar() {
    const searchInput = document.querySelector('#search');
    const topBarHandle = document.querySelector('.top_bar');

    searchInput.onfocus = () => {
      topBarHandle.classList.add('top_bar--search_focus');
    };

    searchInput.onblur = () => {
      topBarHandle.classList.remove('top_bar--search_focus');
    };

    const minifierButton = document.querySelector('.top_bar .minifier');
    if (minifierButton) {
      minifierButton.onclick = this.toggleMinify;
    }
  }

  render() {
    const { ActivePanel, options, isMinified } = this.state;

    return <div className={classnames('panel_container',
      { 'panel_container--hidden': isMinified }
    )}>
      <ActivePanel {...options} />
    </div>;
  }
}
