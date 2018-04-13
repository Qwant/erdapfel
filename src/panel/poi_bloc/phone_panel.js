import PhoneView from '../../views/poi_bloc/phone.dot'
import Panel from "../../libs/panel";
import PoiPanel from "../poi_panel"


function Phone(tag) {
  this.panel = new Panel(this, PhoneView)
  this.tag = tag
}

export default Phone
