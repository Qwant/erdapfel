import InternetAccessView from '../../views/poi_bloc/internet_access.dot'
import Panel from "../../libs/panel";

function InternetAccess(block) {
  this.panel = new Panel(this, InternetAccessView)
  this.ia = block
}

InternetAccess.prototype.toString = function () {
  if(this.ia['wifi']) {
    return `${_('Internet access', 'poi')} : ${_('WiFi', 'poi')}`
  }
  return ''
}

export default InternetAccess
