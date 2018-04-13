import FilterPanelView from '../views/filter_panel.dot'
import Panel from "../libs/panel";

const filters = require('../../config/filters.yml')

function FilterPanel() {

  this.panel = new Panel(this, FilterPanelView)
  this.categories = filters.categories
  this.displayed = false
  listen('toggle_favorite_panel', () => {
    this.displayed = !this.displayed
    this.panel.update()
  })
}


export default FilterPanel
