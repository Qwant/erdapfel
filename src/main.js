import '@babel/polyfill';
import 'url-search-params-polyfill';
import I18n from './libs/i18n';
import './libs/sync_manager';
import './libs/listen';
import './libs/actions';
import App from './panel/app_panel';
import Store from './adapters/store';

(async function main() {
  window.updateStyleElement = function(elementId, css, cssClass) {
    // First, we remove the element if it exists.
    let el = document.getElementById(elementId);
    if (el) {
      el.remove();
    }

    if (!css || css.length === 0) {
      // No need to create a new element if we have nothing to put inside it...
      return;
    }

    // Then we recreate it.
    el = document.createElement('style');
    el.type = 'text/css';
    el.id = elementId;
    el.innerHTML = `@media(max-width: 640px) { ${cssClass} { ${css} } }`;
    document.getElementsByTagName("head")[0].appendChild(el);
  };

  window.updateLocationButtonStyle = function(css) {
    window.updateStyleElement('location-button-style', css, '.mapboxgl-ctrl-bottom-right');
  };

  window.updateDirectionButtonStyle = function(css) {
    window.updateStyleElement('direction-button-style', css, '.direction_shortcut');
  };

  new I18n();
  await window.setLang();

  new Store();

  window.app = new App('panels');
})();
