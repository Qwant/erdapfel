import PanelsView from 'dot-loader!../views/app_panel.dot'
import Panel from '../libs/panel'
import FavoritePanel from "./favorites_panel";
import PoiPanel from "./poi_panel";
import ErrorHandlerPanel from "./error_panel";

function AppPanel(parent) {
  this.favoritePanel = new FavoritePanel()
  this.poiPanel = new PoiPanel()
  this.errorPanel = new ErrorHandlerPanel()
  this.panel = new Panel(this, PanelsView, parent)
  this.panel.render()
}

export default AppPanel