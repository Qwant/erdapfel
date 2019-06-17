import LoginMasqPanelView from '../views/login_masq.dot';
import Panel from '../libs/panel';
import Store from '../adapters/store';
import nconf from '../../local_modules/nconf_getter';
import MasqOnboardingModal from '../modals/masq_onboarding_modal';

const masqOnboardingModal = new MasqOnboardingModal();

export default class LoginMasqPanel {
  constructor() {
    this.panel = new Panel(this, LoginMasqPanelView);
    this.store = new Store();

    this.isMasqEnabled = nconf.get().masq.enabled;
    this.baseMasqAppUrl = nconf.get().masq.baseMasqAppUrl;

    this.store.onToggleStore(async() => {
      this.isLoggedIn = await this.store.isLoggedIn();
      this.panel.update();
    });
  }

  async init() {
    this.isLoggedIn = await this.store.isLoggedIn();
  }

  async login() {
    try {
      await this.store.login();
    } catch (e) {
      console.warn(`An exception occurred in LoginMasqPanel::login: ${e}`);
    }
  }

  async logout() {
    await this.store.logout();
  }

  openMasqOnboarding() {
    masqOnboardingModal.open();
  }

  openMasq() {
    window.open(this.baseMasqAppUrl, '_blank');
  }
}
