import PhoneView from '../../views/poi_bloc/phone.dot'
import Panel from "../../libs/panel";

function Phone(block) {
  this.panel = new Panel(this, PhoneView)
  this.block = block
}

export default Phone
