import Panel from "../../libs/panel";
import PoiBlocContainerView from '../../views/poi_bloc/poi_bloc_container.dot'

const activePoiSections = require('../../../config/active_poi_section.yml').pois

function PoiBlocContainer() {
  this.panel = new Panel(this, PoiBlocContainerView)
  this.blocs = {}
  activePoiSections.forEach((activePoiSection) => {
    this.blocs[activePoiSection.osmName] = { panel : require(`./${activePoiSection.panel_name}_panel`), options : activePoiSection.options}
  })
  this.tags = []
}

PoiBlocContainer.prototype.set = function(poi) {
  this.tags = poi.tags
  this.poi = poi
  return this
}

PoiBlocContainer.prototype.getBlock = function(name) {
  return this.blocs[name]
}

PoiBlocContainer.prototype.setBock = function(tag) {
  let block = this.blocs[tag.name]
  return new block.panel.default(tag, this.poi, block.options)
}

export default PoiBlocContainer
