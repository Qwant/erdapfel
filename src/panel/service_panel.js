import ServicePanelView from '../views/service_panel.dot'
import Panel from '../libs/panel'
import PanelManager from "../proxies/panel_manager"
import PoiPanel from "./poi_panel"
import Favorite from "./favorites_panel"

function ServicePanel() {
  this.panel = new Panel(this, ServicePanelView)
  this.isFavoriteActive = false
  this.isResultActive = false
  listen('toggle_burger', () => {
    this.panel.toggleClassName(.2,'.service_panel', 'service_panel--open')
  })
  PanelManager.registerListener(this)
}

ServicePanel.prototype.toggleFavorite = function () {
  PanelManager.toggleFavorite()
}

ServicePanel.prototype.toggleResult = function () {
  PanelManager.restorePoi()
}

/* PanelManager listener interface implementation */
ServicePanel.prototype.notify = function () {
  PanelManager.getPanels().forEach((panel) => {
    if(panel instanceof PoiPanel) {
      this.isResultActive = panel.isDisplayed()
    }
    if(panel instanceof Favorite) {
      this.isFavoriteActive = panel.isDisplayed()
    }
  })
  this.panel.update()
}

export default ServicePanel
