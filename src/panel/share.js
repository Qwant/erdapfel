import SharePanelView from '../views/share_panel.dot'
import Panel from "../libs/panel"

export default class Share {
  constructor() {
    this.panel = new Panel(this, SharePanelView)
    this.active = false
  }

  open (url) {
    this.url = url
    this.active = true
    this.panel.update()
  }

  copy () {
    let url = document.getElementById('share_url_data')
    url.select()
    document.execCommand('copy')
    url.blur()
  }

  close () {
    this.active = false
    this.panel.update()
  }
}