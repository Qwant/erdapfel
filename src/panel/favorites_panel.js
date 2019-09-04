import FavoritePanelView from '../views/favorites_panel.dot';
import Panel from '../libs/panel';
import PanelResizer from '../libs/panel_resizer';
import Store from '../adapters/store';
import PoiStore from '../adapters/poi/poi_store';
import Telemetry from '../libs/telemetry';
import layouts from './layouts.js';
import { version } from '../../config/constants.yml';
import nconf from '@qwant/nconf-getter';
import MasqOnboardingModal from '../modals/masq_onboarding_modal';
import poiSubClass from '../mapbox/poi_subclass';
import { openShareModal } from 'src/modals/ShareModal';

const masqEnabled = nconf.get().masq.enabled;
const masqOnboardingModal = new MasqOnboardingModal();

function Favorite() {
  this.active = false;
  this.favoritePois = [];
  this.poiSubClass = poiSubClass;
  this.openMoreMenuPosition = -1;
  this.reduced = false;
  this.maximized = false;

  this.masqEnabled = masqEnabled;
  this.showMasq = false;

  document.addEventListener('click', () => {
    this.closeMoreMenu();
  });

  this.panel = new Panel(this, FavoritePanelView);
  this.panelResizer = new PanelResizer(this.panel);

  this.store = new Store();

  this.store.onToggleStore(async () => {
    await this.updateList();
  });

  listen('store_poi', async poi => {
    await this.add(poi);
  });
}

Favorite.prototype.updateList = async function() {
  this.isLoggedIn = await this.store.isLoggedIn();
  await this.getAll();
  await this.panel.update();

  // check if the footer has to be displayed
  await this.checkDisplayMasqFooter();
};

Favorite.prototype.toggleMore = function(position) {
  if (this.openMoreMenuPosition !== position) {
    this.closeMoreMenu();
  }
  this.openMoreMenu(position);
};

Favorite.prototype.openMoreMenu = function(position) {
  Telemetry.add(Telemetry.FAVORITE_OPEN_MORE);
  this.openMoreMenuPosition = position;
  const menu = document.querySelector(`#favorite_more_${position}`);
  menu.classList.add('favorite_panel__item__more--active');
};

Favorite.prototype.closeMoreMenu = function() {
  const menu = document.querySelector(`#favorite_more_${this.openMoreMenuPosition}`);
  if (menu) {
    menu.classList.remove('favorite_panel__item__more--active');
    this.openMoreMenuPosition = -1;
  }
};

Favorite.prototype.openShare = function(poi) {
  Telemetry.add(Telemetry.FAVORITE_SHARE);
  const url = poi.toAbsoluteUrl();
  openShareModal(url);
};

Favorite.prototype.getAll = async function() {
  this.favoritePois = await PoiStore.getAll();
};

Favorite.prototype.open = async function() {
  Telemetry.add(Telemetry.FAVORITE_OPEN);

  await this.updateList();

  this.active = true;
  this.panelResizer.reset();
  this.panel.update();
  fire("move_mobile_bottom_ui", document.querySelector('.favorite_panel__container').offsetHeight);

  window.execOnMapLoaded(() => {
    fire("move_mobile_bottom_ui", document.querySelector('.favorite_panel__container').offsetHeight);
  });
};

Favorite.prototype.closeAction = function() {
  Telemetry.add(Telemetry.FAVORITE_CLOSE);
  window.app.navigateTo('/');
};

Favorite.prototype.close = function() {
  this.closeMoreMenu();
  this.active = false;
  this.panel.update();
};

Favorite.prototype.go = async function(poi) {
  Telemetry.add(Telemetry.FAVORITE_GO);
  this.active = false;
  this.panel.update();
  window.app.navigateTo(`/place/${poi.toUrl()}`, {
    poi: poi.serialize(),
    centerMap: true,
    isFromFavorite: true,
    layout: layouts.FAVORITE,
  });
};

Favorite.prototype.add = async function(poi) {
  Telemetry.add(Telemetry.FAVORITE_SAVE);
  this.favoritePois.push(poi);
  this.panel.update();
  await this.store.add(poi);
};

Favorite.prototype.del = async function({ poi, index }) {
  Telemetry.add(Telemetry.FAVORITE_DELETE);

  await this.panel.addClassName(0.3, `#favorite_item_${index}`, 'favorite_item--removed');

  const toDelete = [];
  this.favoritePois = this.favoritePois.filter(favorite => {
    if (favorite === poi) {
      toDelete.push(poi);
      return false;
    }
    return true;
  });

  this.panel.update();

  await Promise.all(toDelete.map(p => this.store.del(p)));
};

Favorite.prototype.checkDisplayMasqFooter = async function() {
  this.showMasq = false;
  if (this.masqEnabled && !this.isLoggedIn) {
    this.showMasq = localStorage.getItem(`qmaps_v${version}_favorite_masq_footer`) !== 'false';
  }
  if (this.active === true) {
    this.panel.update();
  }
};

Favorite.prototype.closeMasqFooter = function() {
  localStorage.setItem(`qmaps_v${version}_favorite_masq_footer`, false);
  this.showMasq = false;

  this.panel.update();
  Telemetry.add(Telemetry.MASQ_BANNER_CLOSE);
};

Favorite.prototype.openMasqOnboarding = function() {
  masqOnboardingModal.open();
  Telemetry.add(Telemetry.MASQ_BANNER_CLICK);
};

export default Favorite;
