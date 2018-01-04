import ErrorPanelView from 'dot-loader!../views/error_panel.dot'
import Panel from '../libs/panel'


function Error() {
  this.message = ''
  listen('error_h', (message = '')=>{
    this.message = message
    this.panel.update()
      .then(() => this.panel.animate( .25, '.error_panel', {top:'0px'}))
      .then(() => this.panel.wait(3))
      .then(() => this.panel.animate(.25, '.error_panel', {top:'-100px'}))
      .then(() => this.message = '', this.panel.update())
  })
  this.panel = new Panel(this, ErrorPanelView)
}

export default Error