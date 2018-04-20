import FilterPanelView from '../views/filter_panel.dot'
import Panel from "../libs/panel";
const filters = require('../../config/filters.yml')

function FilterPanel() {
  this.panel = new Panel(this, FilterPanelView)
  this.categories = filters.categories
  this.displayed = false
  this.active = filters.active
}

FilterPanel.prototype.toggleFilter = function () {
  this.displayed = !this.displayed
  this.panel.update()
}

export default FilterPanel
