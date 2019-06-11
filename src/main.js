import '@babel/polyfill';
import I18n from './libs/i18n';
import './libs/listen';
import './libs/actions';
import App from './panel/app_panel';
import './proxies/panel_manager';
import UrlState from './proxies/url_state';
import Store from './adapters/store';
import MasqStore from './libs/masq';
import nconf from '@qwant/nconf-getter';

const masqConfig = nconf.get().masq;
if (!MasqStore.isMasqSupported()) {
  masqConfig.enabled = false;
}

/* global PanelManager */
(async function main() {
  new I18n();
  await window.setLang();

  new Store();

  PanelManager.init();
  UrlState.init();
  window.app = new App('panels');

  UrlState.load();
})();
