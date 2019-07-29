import Panel from '../libs/panel';
import menuView from '../views/menu.dot';
import constants from '../../config/constants.yml';
import LoginMasqPanel from './login_masq';
import SearchInput from '../ui_components/search_input';
import nconf from '@qwant/nconf-getter';
import Store from '../adapters/store';

export default class Menu {
  constructor() {
    this.panel = new Panel(this, menuView);
    this.isOpen = false;
    this.menuItems = constants.menu;
    this.isDirectionActive = nconf.get().direction.enabled;

    this.menuInitialized = true;

    this.isMasqEnabled = nconf.get().masq.enabled;
    if (this.isMasqEnabled) {
      this.menuInitialized = false;
      this.masqPanel = new LoginMasqPanel();

      this.store = new Store();

      this.username = null;
      this.profileImage = null;

      this.store.onToggleStore(async () => {
        this.isLoggedIn = await this.store.isLoggedIn();
        await this.getUserInfo();
        await this.updateAndKeepState();
      });

      this.isLoggedIn = false;

      this.initPromise = this.store.isLoggedIn().then(async b => {
        this.isLoggedIn = b;
        await this.getUserInfo();
      });

      Promise.all([this.initPromise, this.masqPanel.init()]).then(async () => {
        this.menuInitialized = true;
        await this.updateAndKeepState();
      });
    }
  }

  async getUserInfo() {
    if (this.isLoggedIn) {
      const userInfo = await this.store.getUserInfo();
      this.username = userInfo.username;
      this.profileImage = userInfo.profileImage;
      this.defaultProfileImage = userInfo.defaultProfileImage;
    }
  }


  async updateAndKeepState() {
    this.panel.update();
    if (this.isOpen) {
      await Promise.all([
        this.panel.addClassName(.3, '.menu__panel', 'menu__panel--active'),
        this.panel.addClassName(0, '.menu__overlay', 'menu__overlay--active'),
        this.panel.addClassName(.6, '.menu__overlay', 'menu__overlay--fade_active'),
      ]);
    }
  }

  openFavorite() {
    this.close();
    window.app.openFavorite();
  }

  openDirection() {
    this.close();
    if (this.isDirectionActive) {
      window.app.openDirection();
    }
  }

  async open() {
    this.isOpen = true;

    await Promise.all([
      this.panel.addClassName(.3, '.menu__panel', 'menu__panel--active'),
      this.panel.addClassName(0, '.menu__overlay', 'menu__overlay--active'),
      this.panel.addClassName(.6, '.menu__overlay', 'menu__overlay--fade_active'),
    ]);
  }

  async close() {
    this.isOpen = false;
    await Promise.all([
      this.panel.removeClassName(.3, '.menu__panel', 'menu__panel--active'),
      this.panel.removeClassName(.6, '.menu__overlay', 'menu__overlay--fade_active'),
      this.panel.removeClassName(0, '.menu__overlay', 'menu__overlay--active'),
    ]);
  }

  async search() {
    window.app.resetLayout();
    await this.close();
    SearchInput.select();
  }
}
