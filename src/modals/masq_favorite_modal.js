import MasqFavoriteModalView from '../views/masq_favorite_modal.dot'
import Modal from "./modal"
import nconf from "@qwant/nconf-getter"
import Store from "../adapters/store"

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
    this.modal.open()
  }

  close () {
    console.log(document.getElementById("doNotAsk").checked)
    this.modal.close()
  }

  async openMasq () {
    console.log('login')
    await store.login()
    if (store.isLoggedIn) {
      this.close()
    }
  }
}
