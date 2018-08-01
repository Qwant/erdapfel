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
  await this.panel.toggleClassName(.2, '.poi_panel__block__collapse', 'poi_panel__block__collapse--reversed')
  this.panel.update()
}

ServicesInformation.prototype.title = function () {
  let title = this.PoiBlocContainer.toString(this.blocks)
  if(title.length > 180) {
    return `${title.substr(0,180)}…`
  }
  return `${title}…`
}

export default ServicesInformation
