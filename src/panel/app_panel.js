import PanelsView from '../views/app_panel.dot';
import Panel from '../libs/panel';
import FavoritePanel from './favorites_panel';
import PoiPanel from './poi_panel';
import ServicePanel from './service_panel';
import Share from '../modals/share';
import SearchInput from '../ui_components/search_input';
import TopBar from './top_bar';
import GeolocationModal from '../modals/geolocation_modal';
import GeolocationDeniedModal from '../modals/geolocation_denied_modal';
import GeolocationNotActivatedModal from '../modals/geolocation_not_activated_modal';
import MasqFavoriteModal from '../modals/masq_favorite_modal';
import MasqOnboardingModal from '../modals/masq_onboarding_modal';
import MasqErrorModal from '../modals/masq_error_modal';
import MasqActivatingModal from '../modals/masq_activating_modal';
import nconf from '@qwant/nconf-getter';
import DirectionPanel from './direction/direction_panel';
import Menu from './menu';
import Telemetry from '../libs/telemetry';
import CategoryPanel from './category_panel';
import ApiPoi from '../adapters/poi/idunn_poi';

const performanceEnabled = nconf.get().performance.enabled;
const directionEnabled = nconf.get().direction.enabled;
const masqEnabled = nconf.get().masq.enabled;
const categoryEnabled = nconf.get().category.enabled;

export default class AppPanel {
  constructor(parent) {
    this.topBar = new TopBar();
    SearchInput.initSearchInput('#search');
    this.categoryEnabled = categoryEnabled;
    this.directionEnabled = directionEnabled;

    this.sharePanel = new Share();
    this.servicePanel = new ServicePanel();
    this.favoritePanel = new FavoritePanel(this.sharePanel);
    this.poiPanel = new PoiPanel(this.sharePanel);
    this.categoryPanel = this.categoryEnabled ? new CategoryPanel() : null;
    this.directionPanel = this.directionEnabled ? new DirectionPanel(this.sharePanel) : null;

    this.panels = [
      this.servicePanel,
      this.favoritePanel,
      this.poiPanel,
    ];
    if (this.categoryEnabled) {
      this.panels.push(this.categoryPanel);
    }
    if (this.directionPanel) {
      this.panels.push(this.directionPanel);
    }

    this.panel = new Panel(this, PanelsView, parent);
    this.geolocationModal = new GeolocationModal();
    this.geolocationDeniedModal = new GeolocationDeniedModal();
    this.geolocationNotActivatedModal = new GeolocationNotActivatedModal();

    this.masqEnabled = masqEnabled;
    if (this.masqEnabled) {
      this.masqFavoriteModal = new MasqFavoriteModal();
      this.masqOnboardingModal = new MasqOnboardingModal();
      this.masqErrorModal = new MasqErrorModal();
      this.masqActivatingModal = new MasqActivatingModal();
    }

    this.menu = new Menu();

    this.activePoiId = null;

    if (performanceEnabled) {
      this.panel.onRender = () => {
        window.times.appRendered = Date.now();
      };
    }

    this.panel.render();
    Telemetry.add(Telemetry.APP_START);
  }

  minify() {
    SearchInput.minify();
    document.querySelector('.side_panel__container').classList.add('side_panel__container--hidden');
  }

  unminify() {
    document.querySelector('.side_panel__container')
      .classList
      .remove('side_panel__container--hidden');
    SearchInput.unminify();
  }

  toggleMinify() {
    if (SearchInput.isMinified()) {
      this.unminify();
    } else {
      this.minify();
    }
  }

  async setPoi(poi, options = {}) {
    this.activePoiId = poi.id;
    window.execOnMapLoaded(function() {
      if (!options.isFromCategory) {
        fire('map_mark_poi', poi);
      }
      if (!options.disableMapPan) {
        fire('fit_map', poi, options.layout);
      }
    });
    this.panels.forEach(panel => {
      if (panel.isPoiCompliant) {
        panel.setPoi(poi, options);
      } else if (!options.isFromCategory && !options.isFromFavorite) {
        panel.close();
      }
    });
    this.unminify();
  }

  async loadPoiById(id, options) {
    const poi = id && await ApiPoi.poiApiLoad(id);
    if (poi) {
      this.setPoi(poi, options);
      return;
    }
    this.resetLayout();
  }

  unsetPoi() {
    this.activePoiId = null;
    fire('clean_marker');
  }

  emptyClickOnMap() {
    this.panels.forEach(p => {
      if (p.emptyClickOnMap) {
        p.emptyClickOnMap();
      }
    });
  }

  _openPanel(panelToOpen, options) {
    /*
      "unminify" needs to be called before panel.open :
      DirectionPanel will minify the main search input (unused for Directions)
    */
    this.unminify();
    this.panels.forEach(panel => {
      if (panel === panelToOpen) {
        panel.open(options);
      } else {
        panel.close();
      }
    });
  }

  openDirection(options) {
    this._openPanel(this.directionPanel, options);
  }

  openFavorite() {
    this._openPanel(this.favoritePanel);
  }

  openCategory(options) {
    this._openPanel(this.categoryPanel, options);
  }

  resetLayout() {
    this._openPanel(this.servicePanel);
  }
}
