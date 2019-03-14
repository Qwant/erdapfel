import Panel from '../libs/panel'
import menuView from '../views/menu.dot'
import constants from '../../config/constants.yml'
import PanelManager from "../proxies/panel_manager";
import nconf from "../../local_modules/nconf_getter";

export default class Menu {
  constructor() {
    this.panel = new Panel(this, menuView)
    this.isOpen = false
    this.menuItems = constants.menu
    this.isDirectionActive = nconf.get().direction.enabled
  }

  toggleFavorite() {
    this.close()
    PanelManager.toggleFavorite()
  }

  toggleDirection() {
    this.close()
    if(this.isDirectionActive) {
      PanelManager.toggleDirection()
    }
  }

  async open() {
    this.isOpen = true
    this.panel.addClassName(.3, '.menu__panel', 'menu__panel--active')

    await this.panel.addClassName(0, '.menu__overlay', 'menu__overlay--active')
    this.panel.addClassName(.6, '.menu__overlay', 'menu__overlay--fade_active')
  }

  async close() {
    this.isOpen = false
    this.panel.removeClassName(.3, '.menu__panel', 'menu__panel--active')

    await this.panel.removeClassName(.6, '.menu__overlay', 'menu__overlay--fade_active')
    this.panel.removeClassName(0, '.menu__overlay', 'menu__overlay--active')
  }
}
