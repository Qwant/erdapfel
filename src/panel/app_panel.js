import PanelsView from '../views/app_panel.dot'
import Panel from '../libs/panel'
import FavoritePanel from "./favorites_panel";
import RegisterMasqPanel from "./register_masq";
import PoiPanel from "./poi_panel";
import ErrorHandlerPanel from "./error_panel";
import ServicePanel from './service_panel';
import Share from "../modals/share"
import Autocomplete from "../adapters/autocomplete";
import TopBar from "./top_bar";
import GeolocationModal from "../modals/geolocation_modal";
import GeolocationDeniedModal from "../modals/geolocation_denied_modal";
import nconf from "@qwant/nconf-getter"

const performanceEnabled = nconf.get().performance.enable
import Telemetry from "../libs/telemetry";

function AppPanel(parent) {
  new TopBar()
  this.autocomplete = new Autocomplete('#search')
  this.sharePanel = new Share()
  this.servicePanel = new ServicePanel()
  this.favoritePanel = new FavoritePanel(this.sharePanel)
  this.poiPanel = new PoiPanel(this.sharePanel)
  this.errorPanel = new ErrorHandlerPanel()
  this.masqPanel = new RegisterMasqPanel()
  this.panel = new Panel(this, PanelsView, parent)
  this.geolocationModal = new GeolocationModal()
  this.geolocationDeniedModal = new GeolocationDeniedModal()

  if(performanceEnabled) {
    this.panel.onRender = () => {
      window.times.appRendered = Date.now()
    }
  }

  this.panel.render()
  Telemetry.add(Telemetry.APP_START)
  return this.panel
}

export default AppPanel
