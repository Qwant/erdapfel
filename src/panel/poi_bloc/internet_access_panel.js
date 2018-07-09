import InternetAccessView from '../../views/poi_bloc/internet_access.dot'
import Panel from "../../libs/panel";

function InternetAccess(block) {
  this.panel = new Panel(this, InternetAccessView)
  this.ia = block
}

export default InternetAccess
