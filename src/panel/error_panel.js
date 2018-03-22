import ErrorPanelView from 'dot-loader!../views/error_panel.dot'
import Panel from '../libs/panel'

function Error() {
  this.message = ''
  listen('error_h', (message = '') => {
    this.showMessage(message)
  })
  this.panel = new Panel(this, ErrorPanelView)
}

Error.prototype.showMessage = async function (message) {
  this.message = message
  await this.panel.update()
  await this.panel.animate( .25, '.error_panel', {top:'0px'})
  await this.panel.wait(3)
  await this.panel.animate(.25, '.error_panel', {top:'-100px'})
  this.message = ''
  this.panel.update()
}

export default Error