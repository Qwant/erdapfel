import MasqFavoriteModalView from '../views/masq_favorite_modal.dot'
import Modal from "./modal"
import nconf from "@qwant/nconf-getter"
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
  }


  open () {
    let doNotAskAgain = localStorage.getItem(`qmaps_v${version}_add_favorite_ask_masq`)
    if (doNotAskAgain === "false" || doNotAskAgain === null) {
      this.modal.open()
    }
  }

  close () {
    const doNotAskAgain = document.getElementById("doNotAsk").checked
    localStorage.setItem(`qmaps_v${version}_add_favorite_ask_masq`, doNotAskAgain)
    this.modal.close()
  }

  async openMasq () {
    await store.login()
    if (store.isLoggedIn) {
      this.close()
    }
  }
}
