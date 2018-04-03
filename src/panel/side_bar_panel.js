import SideBarPanelView from 'dot-loader!../views/side_bar_panel.dot'
import Panel from '../libs/panel'

function SideBarPanel() {
  this.panel = new Panel(this, SideBarPanelView)
}


SideBarPanel.prototype.showFavorites = function () {
  fire('open_favorite')
}

export default SideBarPanel