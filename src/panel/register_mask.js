import RegisterMaskPanelView from 'dot-loader!../views/register_mask.dot'
import Panel from "../libs/panel";



function RegisterMaskPanel() {
  this.panel = new Panel(this, RegisterMaskPanelView)
}


export default RegisterMaskPanel