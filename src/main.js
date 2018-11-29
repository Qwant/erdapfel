import "@babel/polyfill";
import I18n from './libs/i18n'
import './libs/listen'
import './libs/actions'
import App from './panel/app_panel'
import PanelManager from "./proxies/panel_manager";
import UrlState from "./proxies/url_state";
import nconf from "../local_modules/nconf_getter"

const performanceEnabled = nconf.get().performance.enable
console.log(performanceEnabled)
async function main() {
  new I18n()
  await setLang()

  PanelManager.init()
  UrlState.init()
  const app = new App('panels')
  if(performanceEnabled) {
    app.onRender = () => {
      window.times.appRendered = performance.now()
    }
  }
  UrlState.load()
}
main()
