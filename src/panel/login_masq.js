import LoginMasqPanelView from '../views/login_masq.dot';
import Panel from '../libs/panel';
import Store from '../adapters/store';
import nconf from '@qwant/nconf-getter';
import MasqOnboardingModal from '../modals/masq_onboarding_modal';
import Telemetry from '../libs/telemetry';

const masqOnboardingModal = new MasqOnboardingModal();

export default class LoginMasqPanel {
  constructor() {
    this.panel = new Panel(this, LoginMasqPanelView);
    this.store = new Store();

    this.isMasqEnabled = nconf.get().masq.enabled;
    this.baseMasqAppUrl = nconf.get().masq.baseMasqAppUrl;

    this.username = null;
    this.profileImage = null;

    this.store.onToggleStore(async() => {
      this.isLoggedIn = await this.store.isLoggedIn();
      await this.getUserInfo();
      this.panel.update();
    });

    this.isLoggedIn = false;
    this.initPromise = this.store.isLoggedIn().then(async b => {
      this.isLoggedIn = b;
      await this.getUserInfo();
    });
  }

  async getUserInfo() {
    if (this.isLoggedIn) {
      const userInfo = await this.store.getUserInfo();
      this.username = userInfo.username;
      this.profileImage = userInfo.profileImage;
      this.defaultProfileImage = userInfo.defaultProfileImage;
    }
  }

  async init() {
    await this.initPromise;
  }

  async login() {
    try {
      Telemetry.add(Telemetry.MASQ_MENU_ACTIVATE);
      await this.store.login();
    } catch (e) {
      console.warn(`An exception occurred in LoginMasqPanel::login: ${e}`);
    }
  }

  async logout() {
    Telemetry.add(Telemetry.MASQ_MENU_DESACTIVATE);
    await this.store.logout();
  }

  openMasqOnboarding() {
    Telemetry.add(Telemetry.MASQ_MENU_ONBOARDING);
    masqOnboardingModal.open();
  }

  openMasq() {
    Telemetry.add(Telemetry.MASQ_MENU_OPEN);
    window.open(this.baseMasqAppUrl, '_blank');
  }
}
