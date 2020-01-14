import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import SearchInput from '../ui_components/search_input';
import nconf from '@qwant/nconf-getter';
import Telemetry from '../libs/telemetry';
import Router from 'src/proxies/app_router';
import { parseMapHash, parseQueryString, joinPath, getCurrentUrl } from 'src/libs/url_utils';
import FavoritesPanel from './favorites/FavoritesPanel';
import PoiPanel from './PoiPanel';
import ServicePanel from './ServicePanel';
import EventListPanel from './event/EventListPanel';
import CategoryPanel from 'src/panel/category/CategoryPanel';
import DirectionPanel from 'src/panel/direction/DirectionPanel';
import Device from '../libs/device';
import Menu from 'src/panel/Menu';
import classnames from 'classnames';

const performanceEnabled = nconf.get().performance.enabled;
const directionEnabled = nconf.get().direction.enabled;
const categoryEnabled = nconf.get().category.enabled;
const eventEnabled = nconf.get().events.enabled;

export default class App {
  constructor() {
    this.initMap();

    SearchInput.initSearchInput('#search');

    Telemetry.add(Telemetry.APP_START, null, null, {
      'language': window.getLang(),
      'is_mobile': Device.isMobile(),
    });
    if (performanceEnabled) {
      listen('map_loaded', () => { window.times.mapLoaded = Date.now(); });
    }

    this.initRouter();
  }

  updatePanel(activePanel, options) {
    ReactDOM.render(<PanelManager
      ActivePanel={activePanel}
      options={options}
    />, document.querySelector('#react_root'));
  }

  initMap() {
    const mapHash = parseMapHash(window.location.hash);
    import(/* webpackChunkName: "map" */ '../adapters/scene')
      .then(({ default: Scene }) => {
        const scene = new Scene();
        scene.initScene(mapHash);
      });
  }

  initRouter() {
    this.router = new Router(window.baseUrl);

    if (categoryEnabled) {
      this.router.addRoute('Category', '/places/(.*)', placesParams => {
        const { type: categoryName, q: query, ...otherOptions } = parseQueryString(placesParams);
        this.updatePanel(CategoryPanel, { categoryName, query, ...otherOptions });
      });
    }

    if (eventEnabled) {
      this.router.addRoute('EventListPanel', '/events/(.*)', eventsParams => {
        const { type: eventName, ...otherOptions } = parseQueryString(eventsParams);
        this.updatePanel(EventListPanel, { eventName, ...otherOptions });
      });
    }

    this.router.addRoute('POI', '/place/(.*)', async (poiUrl, options = {}) => {
      const poiId = poiUrl.split('@')[0];
      this.updatePanel(PoiPanel, { ...options, poiId });
    });

    this.router.addRoute('Favorites', '/favs', () => {
      this.updatePanel(FavoritesPanel);
    });

    if (directionEnabled) {
      this.router.addRoute('Routes', '/routes(?:/?)(.*)', (routeParams, options) => {
        this.updatePanel(DirectionPanel, { ...parseQueryString(routeParams), ...options });
      });
    }

    this.router.addRoute('Direct search query', '/([?].*)', queryString => {
      const params = parseQueryString(queryString);
      if (params.q) {
        SearchInput.executeSearch(params.q);
      } else {
        this.navigateTo('/');
      }
    });

    // Default matching route
    this.router.addRoute('Services', '/?', (_, options = {}) => {
      this.updatePanel(ServicePanel, options);
      if (options.focusSearch) {
        SearchInput.select();
      }
    });

    window.onpopstate = ({ state }) => {
      this.router.routeUrl(getCurrentUrl(), state);
    };

    // Route the initial URL
    this.router.routeUrl(getCurrentUrl());
  }

  // @TODO: move that outside so we don't need to call window.app.navigateTo
  /**
  * @param {string} url - The URL to navigate to.
  * @param {Object} state - State object to associate with the history entry.
  * @param {Object} options
  * @param {boolean} options.replace - If true, the new state/url will replace the current state in browser history
  * @param {boolean} options.routeUrl- If true, the new URL will be evaluated by the router.
  */
  navigateTo(url, state = {}, { replace = false, routeUrl = true } = {}) {
    const urlWithCurrentHash = joinPath([window.baseUrl, url]) + location.hash;
    if (replace) {
      window.history.replaceState(state, null, urlWithCurrentHash);
    } else {
      window.history.pushState(state, null, urlWithCurrentHash);
    }
    if (routeUrl) {
      this.router.routeUrl(urlWithCurrentHash, state);
    }
  }

  updateHash(hash) {
    const urlWithoutHash = window.location.href.split('#')[0];
    window.history.replaceState(window.history.state, null, `${urlWithoutHash}#${hash}`);
  }
}

class PanelManager extends React.Component {
  static propTypes = {
    ActivePanel: PropTypes.func.isRequired,
    options: PropTypes.object,
  };

  static defaultProps = {
    options: {},
  };

  state = {
    isMinified: false,
  };

  componentDidMount() {
    if (performanceEnabled) {
      window.times.appRendered = Date.now();
    }
    this.initTopBar();
  }

  componentDidUpdate(previousProps) {
    const { ActivePanel, options } = this.props;

    if (previousProps.ActivePanel !== ActivePanel || previousProps.options !== options) {
      if (ActivePanel !== PoiPanel || !options.isFromCategory) {
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

  toggleMinify = () => {
    if (this.state.isMinified) {
      SearchInput.unminify();
      this.setState({ isMinified: false });
    } else {
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
    const { ActivePanel, options } = this.props;
    const { isMinified } = this.state;

    return <Fragment>
      <div className={classnames('side_panel__container', {
        'side_panel__container--hidden': isMinified }
      )}>
        <div className="favorite_poi_panel__container">
          <ActivePanel {...options} />
        </div>
      </div>
      <Menu />
    </Fragment>;
  }
}
