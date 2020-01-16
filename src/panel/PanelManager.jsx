import React from 'react';
import PropTypes from 'prop-types';
import SearchInput from '../ui_components/search_input';
import nconf from '@qwant/nconf-getter';
import FavoritesPanel from './favorites/FavoritesPanel';
import PoiPanel from './PoiPanel';
import ServicePanel from './ServicePanel';
import EventListPanel from './event/EventListPanel';
import CategoryPanel from 'src/panel/category/CategoryPanel';
import DirectionPanel from 'src/panel/direction/DirectionPanel';
import classnames from 'classnames';
import { parseQueryString, getCurrentUrl } from 'src/libs/url_utils';

const performanceEnabled = nconf.get().performance.enabled;
const directionEnabled = nconf.get().direction.enabled;
const categoryEnabled = nconf.get().category.enabled;
const eventEnabled = nconf.get().events.enabled;

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
    this.initRouter();
    this.initTopBar();
    if (performanceEnabled) {
      window.times.appRendered = Date.now();
    }
  }

  componentDidUpdate(_prevProps, prevState) {
    const { ActivePanel, options } = this.state;

    if (prevState.ActivePanel !== ActivePanel || prevState.options !== options) {
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

  initRouter() {
    const router = this.props.router;

    if (categoryEnabled) {
      router.addRoute('Category', '/places/(.*)', placesParams => {
        const { type: categoryName, q: query, ...otherOptions } = parseQueryString(placesParams);
        this.setState({
          ActivePanel: CategoryPanel,
          options: { categoryName, query, ...otherOptions },
        });
      });
    }

    if (eventEnabled) {
      router.addRoute('EventListPanel', '/events/(.*)', eventsParams => {
        const { type: eventName, ...otherOptions } = parseQueryString(eventsParams);
        this.setState({
          ActivePanel: EventListPanel,
          options: { eventName, ...otherOptions },
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

    if (directionEnabled) {
      router.addRoute('Routes', '/routes(?:/?)(.*)', (routeParams, options) => {
        this.setState({
          ActivePanel: DirectionPanel,
          options: { ...parseQueryString(routeParams), ...options },
        });
      });
    }

    router.addRoute('Direct search query', '/([?].*)', queryString => {
      const params = parseQueryString(queryString);
      if (params.q) {
        SearchInput.executeSearch(params.q);
      } else {
        router.routeUrl.navigateTo('/');
      }
    });

    // Default matching route
    router.addRoute('Services', '/?', (_, options = {}) => {
      this.setState({ ActivePanel: ServicePanel, options });
      if (options.focusSearch) {
        SearchInput.select();
      }
    });

    // Route the initial URL
    router.routeUrl(getCurrentUrl());
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
