import PanelsView from '../views/app_panel.dot'
import Panel from '../libs/panel'
import FavoritePanel from "./favorites_panel";
import LoginMasqPanel from "./login_masq";
import PoiPanel from "./poi_panel";
import ServicePanel from './service_panel';
import Share from "../modals/share"
import SearchInput from "../ui_components/search_input";
import TopBar from "./top_bar";
import GeolocationModal from "../modals/geolocation_modal";
import GeolocationDeniedModal from "../modals/geolocation_denied_modal";
import nconf from "@qwant/nconf-getter"
import DirectionPanel from './direction/direction_panel'
import Menu from "./menu";

const performanceEnabled = nconf.get().performance.enabled
const directionEnabled = nconf.get().direction.enabled
const masqEnabled = nconf.get().masq.enabled
import Telemetry from "../libs/telemetry";
import {CategoriesPanel} from "./categories_panel";

function AppPanel(parent) {
  new TopBar()
  SearchInput.initSearchInput('#search')
  this.sharePanel = new Share()
  this.servicePanel = new ServicePanel()
  this.favoritePanel = new FavoritePanel(this.sharePanel)
  this.poiPanel = new PoiPanel(this.sharePanel)
  this.category = new CategoriesPanel()

  this.directionEnabled = directionEnabled
  if (this.directionEnabled) {
    this.directionPanel = new DirectionPanel()
  }

  this.masqEnabled = masqEnabled
  if (this.masqEnabled) {
    this.masqPanel = new LoginMasqPanel()
  }
  this.panel = new Panel(this, PanelsView, parent)
  this.geolocationModal = new GeolocationModal()
  this.geolocationDeniedModal = new GeolocationDeniedModal()
  this.menu = new Menu()

  if(performanceEnabled) {
    this.panel.onRender = () => {
      window.times.appRendered = Date.now()
    }
  }

  this.panel.render()
  Telemetry.add(Telemetry.APP_START)
}

export default AppPanel
