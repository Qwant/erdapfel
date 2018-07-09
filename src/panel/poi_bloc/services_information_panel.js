import ServicesInformationView from '../../views/poi_bloc/services_information.dot'
import Panel from "../../libs/panel"
import PoiBlocContainer from "./poi_bloc_container";

function ServicesInformation(block) {
  this.blocks = block.blocks
  this.PoiBlocContainer = PoiBlocContainer
  this.panel = new Panel(this, ServicesInformationView)
}

ServicesInformation.prototype.toggle = async function () {
  this.extended = !this.extended
  this.panel.toggleClassName(.2, '.poi_panel__block__information', 'poi_panel__block__information--extended')
  this.panel.toggleClassName(.2, '.poi_panel__block__collapse', 'icon-icon_chevron-up')
}

export default ServicesInformation
