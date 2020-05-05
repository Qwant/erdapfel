import '@babel/polyfill';
import 'url-search-params-polyfill';
import I18n from './libs/i18n';
import './libs/sync_manager';
import App from './panel/app_panel';
import Store from './adapters/store';

(async function main() {
  new I18n();
  await window.setLang();

  new Store();

  window.app = new App();
})();
