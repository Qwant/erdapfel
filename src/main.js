import "@babel/polyfill";
import I18n from './libs/i18n'
import './libs/listen'
import './libs/actions'
import App from './panel/app_panel'
import PanelManager from "./proxies/panel_manager";
import UrlState from "./proxies/url_state";

async function main() {
  new I18n()
  await setLang()

  PanelManager.init()
  UrlState.init()
  new App('panels')
  UrlState.load()
}
main()
