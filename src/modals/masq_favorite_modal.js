import MasqFavoriteModalView from '../views/masq_favorite_modal.dot'
import Modal from "./modal"
import Store from "../adapters/store"
import {version} from '../../config/constants.yml'

const store = new Store()

export default class MasqFavoriteModal {
  constructor() {
    // get masqFavoriteModal from window if already initialized
    if (window.__masqFavoriteModal) {
      return window.__masqFavoriteModal
    }
    // if masqFavoriteModal not initialized, use this
    window.__masqFavoriteModal = this

    this.modal = new Modal(this, MasqFavoriteModalView)

    this.eventTarget = document.createElement('masqFavoriteModal')

    this.opened = false
  }


  open () {
    let doNotAskAgain = localStorage.getItem(`qmaps_v${version}_add_favorite_ask_masq`)
    if (doNotAskAgain === "false" || doNotAskAgain === null) {
      this.opened = true
      this.modal.open()
    }
  }

  close () {
    const doNotAskAgain = document.getElementById("doNotAsk").checked
    localStorage.setItem(`qmaps_v${version}_add_favorite_ask_masq`, doNotAskAgain)
    this.modal.close()
    this.eventTarget.dispatchEvent(new Event('closed'))
    this.opened = false
  }

  async openMasq () {
    await store.login()
    if (await store.isLoggedIn()) {
      this.close()
    }
  }

  waitForClose() {
    if (!this.opened) {
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      this.eventTarget.addEventListener('closed', resolve, {once: true})
    })
  }
}
