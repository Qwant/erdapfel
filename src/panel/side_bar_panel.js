import SideBarPanelView from '../views/side_bar_panel.dot'
import Panel from '../libs/panel'

function SideBarPanel() {
  this.panel = new Panel(this, SideBarPanelView)
}


SideBarPanel.prototype.toggleFavorite = function () {
  fire('toggle_favorite')
}

export default SideBarPanel