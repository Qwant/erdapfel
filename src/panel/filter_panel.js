import FilterPanelView from '../views/filter_panel.dot'
import Panel from "../libs/panel";

function FilterPanel() {
  this.panel = new Panel(this, FilterPanelView)
  this.categories = []
  this.displayed = false
  this.active = []
}

FilterPanel.prototype.toggleFilter = function () {
  this.displayed = !this.displayed
  this.panel.update()
}

export default FilterPanel
