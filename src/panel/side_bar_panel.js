import SideBarPanelView from '../views/side_bar_panel.dot'
import Panel from '../libs/panel'
import PanelManager from "../proxies/panel_manager"
import PoiPanel from "./poi_panel"
import Favorite from "./favorites_panel"

function SideBarPanel() {
  this.panel = new Panel(this, SideBarPanelView)
  this.isFaforiteActive = false
  this.isResultActive = false
  listen('store_poi', async () => {
    await this.panel.addClassName(.2, '.side_bar__fav__add', 'side_bar__fav__add--active')
    await this.panel.wait(1)
    this.panel.removeClassName(.2, '.side_bar__fav__add', 'side_bar__fav__add--active')
  })
  listen('toggle_burger', () => {
    this.panel.toggleClassName(.2,'.side_bar', 'side_bar--open')
  })
  PanelManager.registerListener(this)
}

SideBarPanel.prototype.toggleFavorite = function () {
  PanelManager.toggleFavorite()
}

SideBarPanel.prototype.home = function () {
  PanelManager.closeAll()
  fire('map_reset')
}

SideBarPanel.prototype.toggleResult = function () {
  PanelManager.restorePoi()
}

/* PanelManager listener interface implementation */
SideBarPanel.prototype.notify = function () {
  PanelManager.getPanels().forEach((panel) => {
    if(panel instanceof PoiPanel) {
      this.isResultActive = panel.isDisplayed()
    }
    if(panel instanceof Favorite) {
      this.isFaforiteActive = panel.isDisplayed()
    }
  })
  this.panel.update()
}

export default SideBarPanel
