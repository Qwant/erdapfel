import SharePanelView from '../views/share_panel.dot'
import Panel from "../libs/panel"
import facebookTemplate from '../views/templates/facebook'
import twitterTemplate from '../views/templates/twitter'
export default class Share {
  constructor() {
    this.panel = new Panel(this, SharePanelView)
    this.active = false
    this.facebookTemplate = facebookTemplate
    this.twitterTemplate = twitterTemplate
  }

  open (shareUrl) {
    this.shareUrl = shareUrl
    this.active = true
    this.panel.update()
  }

  async copy () {
    let url = document.getElementById('share_url_data')
    url.select()
    document.execCommand('copy')
    url.blur()
    await this.panel.toggleClassName(.5, '#share-copy-status', 'share__copy_status--hidden')
    this.panel.toggleClassName(.5, '#share-copy-status', 'share__copy_status--hidden')
  }

  close () {
    this.active = false
    this.panel.update()
  }

  openPopup () {
    return `onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');return false;"`
  }
}