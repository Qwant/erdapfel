import React from 'react';
import ReactDOM from 'react-dom';
import Panel from '../libs/panel';
import menuView from '../views/menu.dot';
import constants from '../../config/constants.yml';
import MasqStatus from './MasqStatus';
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
      this.masqUser = null;
      this.isLoggedIn = false;
      this.store = new Store();

      this.store.onToggleStore(async () => {
        this.isLoggedIn = await this.store.isLoggedIn();
        await this.getUserInfo();
        await this.updateAndKeepState();
      });

      this.store.isLoggedIn().then(async loggedIn => {
        this.isLoggedIn = loggedIn;
        this.menuInitialized = true;
        await this.getUserInfo();
        await this.updateAndKeepState();
      });
    }
  }

  async getUserInfo() {
    if (this.isLoggedIn) {
      this.masqUser = await this.store.getUserInfo();
    } else {
      this.masqUser = null;
    }
  }

  async updateAndKeepState() {
    this.panel.update();
    if (this.isMasqEnabled) {
      ReactDOM.render(
        <MasqStatus store={this.store} user={this.masqUser} />,
        document.querySelector('.react_masqLogin_container')
      );
    }
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
    window.app.navigateTo('/favs');
  }

  openDirection() {
    this.close();
    if (this.isDirectionActive) {
      window.app.navigateTo('/routes/');
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
    window.app.navigateTo('/');
    await this.close();
    SearchInput.select();
  }
}
