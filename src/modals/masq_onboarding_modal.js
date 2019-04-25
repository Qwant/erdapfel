import MasqOnboardingModalView from '../views/masq_onboarding_modal.dot'
import Modal from "./modal"
import Store from "../adapters/store"
import {version} from '../../config/constants.yml'

const store = new Store()

export default class MasqOnboardingModal {
  constructor() {
    // get masqOnboardingModal from window if already initialized
    if (window.__masqOnboardingModal) {
      return window.__masqOnboardingModal
    }
    // if masqOnboardingModal not initialized, use this
    window.__masqOnboardingModal = this

    this.modal = new Modal(this, MasqOnboardingModalView)

    this.eventTarget = document.createElement('masqOnboardingModal')

    this.opened = false
    this.explain = false
    this.step = 1
  }


  open () {
    this.opened = true
    this.modal.open()
  }

  close () {
    this.modal.close()
    this.eventTarget.dispatchEvent(new Event('closed'))
    this.opened = false
    this.explain = false
  }

  async openMasq () {
    try {
      await store.login()
    } catch(e) {
    }
    this.close()
  }

  waitForClose() {
    if (!this.opened) {
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      this.eventTarget.addEventListener('closed', resolve, {once: true})
    })
  }

  async openSteps () {
    this.explain = true
    this.step = 1
    this.modal.panel.update()
  }

  async previousStep () {
    if (this.step === 1) {
      this.step = 3
    } else {
      this.step = this.step - 1
    }
    this.modal.panel.update()
  }

  async nextStep () {
    if (this.step === 3) {
      this.step = 1
    } else {
      this.step = this.step + 1
    }
    this.modal.panel.update()
  }

  async setStep (nb) {
    this.step = nb
    this.modal.panel.update()
  }
}
