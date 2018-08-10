import SideBarPanelView from '../views/side_bar_panel.dot'
import Panel from '../libs/panel'
import PanelManager from "../proxies/panel_manager"

function SideBarPanel() {
  this.panel = new Panel(this, SideBarPanelView)
  this.isFaforiteActive = false
  this.isResultActive = false
  listen('close_favorite_panel', () => {
    this.panel.removeClassName(.2, '.side_bar__fav', 'side_bar__item--active')
  })
  listen('store_poi', async () => {
    await this.panel.addClassName(.2, '.side_bar__fav__add', 'side_bar__fav__add--active')
    await this.panel.wait(1)
    this.panel.removeClassName(.2, '.side_bar__fav__add', 'side_bar__fav__add--active')
  })
  listen('toggle_burger', () => {
    this.panel.toggleClassName(.2,'.side_bar', 'side_bar--open')
  })
}

SideBarPanel.prototype.toggleFavorite = function () {
  this.panel.toggleClassName(.2, '.side_bar__fav', 'side_bar__item--active')
  PanelManager.toggleFavorite()
}

SideBarPanel.prototype.home = function () {
  PanelManager.closeAll()
  fire('map_reset')
}

SideBarPanel.prototype.toggleResult = function () {
  this.panel.toggleClassName(.2, '.side_bar__result', 'side_bar__item--active')
  PanelManager.restorePoi()
}

export default SideBarPanel
