import SharePanelView from '../views/share_modal.dot'
import facebookTemplate from '../views/templates/facebook'
import twitterTemplate from '../views/templates/twitter'
import Modal from "./modal"

export default class Share {
  constructor() {
    this.modal = new Modal(this, SharePanelView)
    this.active = false
    this.facebookTemplate = facebookTemplate
    this.twitterTemplate = twitterTemplate
  }

  open (shareUrl) {
    this.shareUrl = shareUrl
    this.active = true
    this.modal.open()
  }

  async copy () {
    let url = document.getElementById('share_url_data')
    url.select()
    document.execCommand('copy')
    url.blur()
    await this.modal.panel.toggleClassName(.5, '#share-copy-status', 'share__copy_status--hidden')
    this.modal.panel.toggleClassName(.5, '#share-copy-status', 'share__copy_status--hidden')
  }

  close () {
    this.active = false
    this.modal.close()
  }

  openPopup () {
    return `onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');return false;"`
  }
}
