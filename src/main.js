import '@babel/polyfill';
import 'url-search-params-polyfill';
import I18n from './libs/i18n';
import './libs/listen';
import './libs/actions';
import App from './panel/app_panel';
import './proxies/panel_manager';
import Store from './adapters/store';
import UrlState from './proxies/url_state';

/* global PanelManager */
(async function main() {
  new I18n();
  await window.setLang();

  new Store();

  PanelManager.init();
  UrlState.init();
  window.app = new App('panels');

  UrlState.load();

  await import(/* webpackChunkName: "map" */ './map');
})();
