import React from 'react';
import renderStaticReact from 'src/libs/renderStaticReact';
import PoiHeader from 'src/panel/poi/PoiHeader';
import PoiTitleImage from 'src/panel/poi/PoiTitleImage';
import OpeningHour from 'src/components/OpeningHour';
import PoiPanelView from '../views/poi_panel.dot';
import Panel from '../libs/panel';
import Store from '../adapters/store';
import PoiBlocContainer from './poi_bloc/poi_bloc_container';
import SearchInput from '../ui_components/search_input';
import Telemetry from '../libs/telemetry';
import layouts from './layouts.js';
import nconf from '@qwant/nconf-getter';
import MasqFavoriteModal from '../modals/masq_favorite_modal';
import Device from '../libs/device';
import CategoryService from '../adapters/category_service';
import poiSubClass from '../mapbox/poi_subclass';
import { openShareModal } from 'src/modals/ShareModal';

const store = new Store();
const masqFavoriteModal = new MasqFavoriteModal();

const headerPartial = poi => renderStaticReact(<PoiHeader poi={poi} />);
const titleImagePartial = poi => renderStaticReact(<PoiTitleImage poi={poi} />);
const openingHourPartial = poi => renderStaticReact(<OpeningHour poi={poi} />);

function PoiPanel() {
  this.isPoiCompliant = true;
  this.poi = null;
  this.active = false;
  this.poiSubClass = poiSubClass;
  this.PoiBlocContainer = PoiBlocContainer;
  this.panel = new Panel(this, PoiPanelView);
  this.lang = window.getBaseLang().code;
  this.card = true;
  this.headerPartial = headerPartial;
  this.titleImagePartial = titleImagePartial;
  this.openingHourPartial = openingHourPartial;
  this.isDirectionActive = nconf.get().direction.enabled;
  this.categories = CategoryService.getCategories();
  this.isMasqEnabled = nconf.get().masq.enabled;

  store.onToggleStore(async () => {
    if (this.poi) {
      this.poi.stored = await isPoiFavorite(this.poi);
      this.panel.update();
    }
  });

  store.eventTarget.addEventListener('poi_added', async () => {
    if (this.poi && !this.poi.stored) {
      this.poi.stored = await isPoiFavorite(this.poi);
      this.panel.update();
    }
  });
}

PoiPanel.prototype.toggleStorePoi = async function() {
  if (this.poi.meta && this.poi.meta.source) {
    Telemetry.add('favorite', 'poi', this.poi.meta.source);
  }
  if (this.poi.stored) {
    this.poi.stored = false;
    await store.del(this.poi);
  } else {
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

PoiPanel.prototype.closeAction = function() {
  window.app.navigateTo('/');
};

PoiPanel.prototype.close = async function() {
  if (!this.active) {
    return;
  }
  fire('clean_marker');
  SearchInput.setInputValue('');

  this.active = false;
  this.panel.update();
};

PoiPanel.prototype.setPoi = async function(poi, options = {}) {
  this.poi = poi;
  this.card = true;
  this.poi.stored = await isPoiFavorite(this.poi);
  this.PoiBlocContainer.set(this.poi);
  this.fromFavorite = false;
  this.fromCategory = false;
  if (options && options.isFromFavorite) {
    this.fromFavorite = options.isFromFavorite;
  }
  if (options && options.isFromCategory) {
    this.fromCategory = options.isFromCategory;
  }
  this.sourceCategory = options.sourceCategory;
  this.active = true;
  await this.panel.update();

  window.execOnMapLoaded(() => {
    fire(
      'move_mobile_bottom_ui',
      document.querySelector('.poi_panel__content__card').offsetHeight + 20
    );
  });
};

PoiPanel.prototype.center = function() {
  if (this.poi.meta && this.poi.meta.source) {
    Telemetry.add('go', 'poi', this.poi.meta.source);
  }
  fire('fit_map', this.poi, layouts.POI);
};

PoiPanel.prototype.openShare = function() {
  if (this.poi.meta && this.poi.meta.source) {
    Telemetry.add('share', 'poi', this.poi.meta.source);
  }
  openShareModal(this.poi.toAbsoluteUrl());
};

PoiPanel.prototype.showDetail = function() {
  if (this.poi.meta && this.poi.meta.source) {
    Telemetry.add(Telemetry.POI_SEE_MORE, null, null,
      Telemetry.buildInteractionData({
        id: this.poi.id,
        source: this.poi.meta.source,
        template: 'single',
        zone: 'detail',
        element: 'more',
      })
    );
  }
  this.card = false;
  this.panel.update();
};

PoiPanel.prototype.backToSmall = function() {
  this.card = true;
  this.panel.update();
};

PoiPanel.prototype.backToFavorite = function() {
  Telemetry.add(Telemetry.POI_BACKTOFAVORITE);
  window.app.navigateTo('/favs');
};

PoiPanel.prototype.backToList = function() {
  Telemetry.add(Telemetry.POI_BACKTOLIST);
  fire('restore_location');
  window.app.navigateTo(`/places/?type=${this.sourceCategory}`);
};

PoiPanel.prototype.openDirection = function() {
  window.app.navigateTo('/routes/', {
    poi: this.poi,
    isFromCategory: this.fromCategory,
    isFromFavorite: this.fromFavorite,
  });
};

PoiPanel.prototype.emptyClickOnMap = function() {
  // On mobile, close poi card when clicking outside (on the map)
  if (Device.isMobile() && this.active) {
    this.closeAction();
  }
};

PoiPanel.prototype.shouldPhoneBeHidden = function() {
  return this.poi && this.poi.isFromPagesjaunes && this.poi.isFromPagesjaunes();
};

PoiPanel.prototype.showPhone = function() {
  document.querySelector('.poi_phone_container_hidden').style.display = 'none';
  document.querySelector('.poi_phone_container_revealed').style.display = 'block';
  const poi = this.poi;
  if (poi && poi.meta && poi.meta.source) {
    Telemetry.add('phone', 'poi', poi.meta.source,
      Telemetry.buildInteractionData({
        id: poi.id,
        source: poi.meta.source,
        template: 'single',
        zone: 'detail',
        element: 'phone',
      })
    );
  }
};

PoiPanel.prototype.openCategory = function(category) {
  window.app.navigateTo(`/places/?type=${category.name}`);
};

/* private */

async function isPoiFavorite(poi) {
  try {
    const storePoi = await store.has(poi);
    if (storePoi) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

export default PoiPanel;
