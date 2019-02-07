import Panel from '../libs/panel'
import menuView from '../views/menu.dot'

export default class Menu {
  constructor() {
    this.panel = new Panel(this, menuView)
    this.isOpen = false
    window._menu = this
  }

  open() {
    this.isOpen = false
  }

  close() {
    this.isOpen = false
  }

  static open() {
    window._menu.open()
  }

  static close() {
    window._menu.close()
  }
}
