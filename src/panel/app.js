import PanelsView from '../views/app_panel.dot'
import Panel from '../libs/panel'
import FavoritePanel from "./favorites_panel";
import RegisterMasqPanel from "./register_masq";
import PoiPanel from "./poi_panel";
import ErrorHandlerPanel from "./error_panel";
import SideBarPanel from './side_bar_panel';

function AppPanel(parent) {
  this.sideBarPanel = new SideBarPanel()
  this.favoritePanel = new FavoritePanel()
  this.poiPanel = new PoiPanel()
  this.errorPanel = new ErrorHandlerPanel()
  this.masqPanel = new RegisterMasqPanel()
  this.panel = new Panel(this, PanelsView, parent)
  this.panel.render()
}

export default AppPanel