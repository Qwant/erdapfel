/* global _ */
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
import Alert from 'src/components/ui/Alert';
import { getBetaPopupClosed, setBetaPopupClosed } from 'src/adapters/store';

const directionConf = nconf.get().direction;
const directSearchRouteName = 'Direct search query';
const initialQueryParams = parseQueryString(window.location.search);

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
      betaPopupClosed: getBetaPopupClosed(),
      client: initialQueryParams['client'],
    };
  }

  async componentDidMount() {
    const initialUrlPathName = window.location.pathname;

    const initialRoute = this.initRouter();

    this.initTopBar();

    if (window.no_ui) {
      // iframe
      Telemetry.add(Telemetry.APP_START_IFRAME, {
        'language': window.getLang(),
        'is_mobile': isMobileDevice(),
        'url_pathname': initialUrlPathName,
        'direct_search': initialRoute.name === directSearchRouteName && !!initialQueryParams['q'],
        'url_client': initialQueryParams['client'] || null,
      });
    } else {
      // no iframe
      Telemetry.add(Telemetry.APP_START, {
        'language': window.getLang(),
        'is_mobile': isMobileDevice(),
        'url_pathname': initialUrlPathName,
        'direct_search': initialRoute.name === directSearchRouteName && !!initialQueryParams['q'],
        'url_client': initialQueryParams['client'] || null,
      });
    }

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
      // poiFilters indicate we are in a "list of POI" context, where markers should be persistent
      if (isNullOrEmpty(options?.poiFilters)) {
        fire('remove_category_markers');
      }
    }

    this.updateSearchBarContent(options);
  }

  updateSearchBarContent({ poiFilters = {}, query } = {}) {
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

    router.addRoute('POI', '/place/([^?]+)', async (poiUrl, options = {}) => {
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

    router.addRoute(directSearchRouteName, '/([?].*)', queryString => {
      const params = parseQueryString(queryString);
      if (params.q) {
        SearchInput.executeSearch(params.q, { fromQueryParams: params });
      } else {
        router.routeUrl('/');
      }
    });

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
  }

  closeBetaPopup = () => {
    setBetaPopupClosed();
    this.setState({ betaPopupClosed: true });
  }

  render() {
    const { ActivePanel, options, panelSize, betaPopupClosed, client } = this.state;

    return <PanelContext.Provider value={{ size: panelSize, setSize: this.setPanelSize }} >
      <div className="panel_container">
        <ActivePanel {...options} />
      </div>

      {
        // Show beta popup if browser language is not french, if popup hasn't already been closed, and if the user comes from an IA
        !navigator.language.includes('fr')
        && !betaPopupClosed
        && client === 'search-ia-local'
        &&
        <Alert
          className=""
          title="Qwant Maps is in Beta!"
          /* eslint-disable max-len */
          description={_('This means that this version may have some bugs. We work very hard to improve Qwant Maps every day, while keeping your travels private.')}
          /* eslint-enable max-len */
          type="info"
          onClose={ this.closeBetaPopup }
        />
      }
    </PanelContext.Provider>;
  }
}
