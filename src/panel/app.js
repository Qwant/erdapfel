import PanelsView from '../views/app_panel.dot'
import Panel from '../libs/panel'
import FavoritePanel from "./favorites_panel";
import RegisterMasqPanel from "./register_masq";
import PoiPanel from "./poi_panel";
import ErrorHandlerPanel from "./error_panel";
import ServicePanel from './service_panel';
import PanelManager from "../proxies/panel_manager";
import UrlState from "../proxies/url_state";
import Share from "./share"
import OpenDataPanel from "./open_data";

function AppPanel(parent) {

  PanelManager.init()
  UrlState.init()

  this.sharePanel = new Share()
  this.servicePanel = new ServicePanel()
  this.openDataPanel = new OpenDataPanel()
  this.favoritePanel = new FavoritePanel(this.sharePanel)
  this.poiPanel = new PoiPanel(this.sharePanel)
  this.errorPanel = new ErrorHandlerPanel()
  this.masqPanel = new RegisterMasqPanel()
  this.panel = new Panel(this, PanelsView, parent)
  this.panel.render()
  UrlState.load()
}

export default AppPanel
