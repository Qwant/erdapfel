import ServicesInformationView from '../../views/poi_bloc/services_information.dot'
import Panel from "../../libs/panel"
import PoiBlocContainer from "./poi_bloc_container";
import Telemetry from "../../libs/telemetry";

function ServicesInformation(block) {
  this.blocks = block.blocks
  this.PoiBlocContainer = PoiBlocContainer
  this.panel = new Panel(this, ServicesInformationView)
}

ServicesInformation.prototype.toggle = async function () {
  if(!this.extended) {
    Telemetry.add(Telemetry.POI_INFORMATION_EXTEND)
  }

  this.extended = !this.extended
  this.panel.toggleClassName(.2, '.poi_panel__block__information', 'poi_panel__block__information--extended')
  await this.panel.toggleClassName(.2, '.poi_panel__block__collapse', 'poi_panel__block__collapse--reversed')
  this.panel.update()
}

ServicesInformation.prototype.title = function () {
  return this.PoiBlocContainer.toString(this.blocks)

}

export default ServicesInformation
