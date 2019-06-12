import AnywherePanelView from '../views/anywhere_panel.dot';
import Panel from '../libs/panel';
import Store from '../adapters/store';
import PoiBlocContainer from './poi_bloc/poi_bloc_container';
import UrlState from '../proxies/url_state';
import HotLoadPoi from '../adapters/poi/hotload_poi';
import Telemetry from '../libs/telemetry';
import headerPartial from '../views/poi_partial/header.dot';
import MinimalHourPanel from './poi_bloc/opening_minimal';
import SceneState from '../adapters/scene_state';
import {paramTypes} from '../proxies/url_shard';
import layouts from './layouts.js';
import nconf from '../../local_modules/nconf_getter';
import MasqFavoriteModal from '../modals/masq_favorite_modal';
import Device from '../libs/device';

import poiSubClass from '../mapbox/poi_subclass';

const store = new Store();
const masqFavoriteModal = new MasqFavoriteModal();

function AnywherePanel(sharePanel) {
  this.isPoiComplient = true; /* Poi Compliant */
  this.poi = null;
  this.active = false;
  this.displayed = false;
  this.poiSubClass = poiSubClass;
  this.list = null;
  this.PoiBlocContainer = PoiBlocContainer;
  this.panel = new Panel(this, AnywherePanelView);
  this.sharePanel = sharePanel;
  this.lang = window.getBaseLang().code;
  this.card = true;
  this.headerPartial = headerPartial;
  this.minimalHourPanel = new MinimalHourPanel();
  this.sceneState = SceneState.getSceneState();
  this.isDirectionActive = nconf.get().direction.enabled;
  PanelManager.register(this);
  UrlState.registerUrlShard(this, 'place', paramTypes.RESOURCE);
  this.isMasqEnabled = nconf.get().masq.enabled;

  store.onToggleStore(async() => {
    if (this.poi) {
      this.poi.stored = await isPoiFavorite(this.poi);
      this.panel.update();
    }
  });

  store.eventTarget.addEventListener('poi_added', async() => {
    if (this.poi && !this.poi.stored) {
      this.poi.stored = await isPoiFavorite(this.poi);
      this.panel.update();
    }
  });
}

AnywherePanel.prototype.toggleStorePoi = async function() {
  if (this.poi.meta && this.poi.meta.source) {
    Telemetry.add('favorite', 'poi', this.poi.meta.source);
  }
  if (this.poi.stored) {
    this.panel.removeClassName(.2, '.poi_panel__actions__icon__store', 'icon-icon_star-filled');
    this.panel.addClassName(.2, '.poi_panel__actions__icon__store', 'icon-icon_star');
    this.poi.stored = false;
    await store.del(this.poi);
  } else {
    this.panel.removeClassName(.2, '.poi_panel__actions__icon__store', 'icon-icon_star');
    this.panel.addClassName(.2, '.poi_panel__actions__icon__store', 'icon-icon_star-filled');

    if (this.isMasqEnabled) {
      const isLoggedIn = await store.isLoggedIn();
      if (!isLoggedIn) {
        masqFavoriteModal.open();
        await masqFavoriteModal.waitForClose();
      }
    }

    this.poi.stored = true;
    await store.add(this.poi);
  }
  this.panel.update();
};

AnywherePanel.prototype.isDisplayed = function() {
  return this.active;
};

AnywherePanel.prototype.closeAction = function() {
  fire('clean_marker');
  PanelManager.resetLayout();
};

AnywherePanel.prototype.close = async function() {
  if (!this.active) {
    return;
  }
  this.active = false;
  this.panel.update();
  this.sceneState.unsetPoiID();
  UrlState.pushUrl();
};

AnywherePanel.prototype.restorePoi = async function(id) {
  Telemetry.add(Telemetry.POI_RESTORE);
  let hotLoadedPoi = new HotLoadPoi();
  if (hotLoadedPoi.id === id) {
    this.poi = hotLoadedPoi;
    window.execOnMapLoaded(() => {
      fire('map_mark_poi', this.poi);
      fire('fit_map', this.poi, layouts.POI);
    });
    this.poi.stored = await isPoiFavorite(this.poi);
    this.active = true;
    this.sceneState.setPoiId(this.poi.id);
    await this.panel.removeClassName(.2, '.poi_panel', 'poi_panel--hidden');
    await this.panel.update();
    this.minimalHourPanel.set(this.poi);
  }
};

AnywherePanel.prototype.setPoi = async function(poi, options = {}) {
  this.poi = poi;
  this.card = true;
  this.poi.stored = await isPoiFavorite(this.poi);
  this.PoiBlocContainer.set(this.poi);
  this.fromFavorite = false;
  this.fromList = false;
  if (options && options.isFromFavorite) {
    this.fromFavorite = options.isFromFavorite;
  }
  if (options && options.isFromList) {
    this.fromList = options.isFromList;
  }
  if (options && options.list) {
    this.list = options.list;
  }
  this.active = true;
  UrlState.pushUrl();
  this.sceneState.setPoiId(this.poi.id);
  await this.panel.update();
  await this.minimalHourPanel.set(this.poi);
};

AnywherePanel.prototype.center = function() {
  if (this.poi.meta && this.poi.meta.source) {
    Telemetry.add('go', 'poi', this.poi.meta.source);
  }
  fire('fit_map', this.poi, layouts.POI);
};

AnywherePanel.prototype.openShare = function() {
  if (this.poi.meta && this.poi.meta.source) {
    Telemetry.add('share', 'poi', this.poi.meta.source);
  }
  this.sharePanel.open(this.poi.toAbsoluteUrl());
};

/* urlState interface implementation */

AnywherePanel.prototype.store = function() {
  // TODO temporary way to store poi, will be replaced by poi id + slug & poi API
  if (this.poi && this.poi.name && this.active) {
    return this.poi.toUrl();
  }
  return '';
};

AnywherePanel.prototype.restore = async function(urlShard) {
  if (urlShard) {
    let idSlugMatch = urlShard.match(/^([^@]+)@?(.*)/);
    if (idSlugMatch && window.hotLoadPoi) {
      let id = idSlugMatch[1];
      await this.restorePoi(id);
    }
  }
};

AnywherePanel.prototype.showDetail = function() {
  Telemetry.add(Telemetry.POI_SEE_MORE, null, null,
      Telemetry.buildInteractionData({
        id: this.poi.id,
        source: this.poi.meta.source,
        template: 'single',
        zone: 'detail',
        element: 'more',
      })
  );
  this.card = false;
  this.panel.update();
};

AnywherePanel.prototype.backToSmall = function() {
  this.card = true;
  this.panel.update();
};

AnywherePanel.prototype.backToFavorite = function() {
  Telemetry.add(Telemetry.POI_BACKTOFAVORITE);
  PanelManager.toggleFavorite();
};

AnywherePanel.prototype.backToList = function() {
  Telemetry.add(Telemetry.POI_BACKTOLIST);
  this.close();
  fire('restore_location');
  this.list.open();
};

AnywherePanel.prototype.openDirection = function() {
  PanelManager.toggleDirection({poi: this.poi});
};

AnywherePanel.prototype.emptyClickOnMap = function() {
  // On mobile, close poi card when clicking outside (on the map)
  if (Device.isMobile() && this.active) {
    this.closeAction();
  }
};

/* private */

async function isPoiFavorite(poi) {
  try {
    let storePoi = await store.has(poi);
    if (storePoi) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

export default AnywherePanel;
