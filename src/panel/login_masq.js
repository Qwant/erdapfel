import LoginMasqPanelView from '../views/login_masq.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import Error from '../adapters/error'
import nconf from "../../local_modules/nconf_getter";
import MasqOnboardingModal from "../modals/masq_onboarding_modal";

const masqOnboardingModal = new MasqOnboardingModal()

export default class LoginMasqPanel {
  constructor() {
    this.panel = new Panel(this, LoginMasqPanelView)
    this.store = new Store()
    this.isLoggedIn = this.store.isLoggedIn()

    this.isMasqEnabled = nconf.get().masq.enabled

    this.store.onToggleStore(() => {
      this.isLoggedIn = this.store.isLoggedIn()
      this.panel.update()
    })
  }

  async login() {
    try {
      await this.store.login()
    } catch(e) {
    }
  }

  async logout() {
    await this.store.logout()
  }

  openMasqOnboarding() {
    masqOnboardingModal.open()
  }
}
