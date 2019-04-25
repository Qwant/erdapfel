import UserInfoPanelView from '../views/masq_user_info.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import nconf from "../../local_modules/nconf_getter";

export default class MasqUserPanel {
  constructor() {
    this.panel = new Panel(this, UserInfoPanelView)
    this.store = new Store()
    this.username = null
    this.profileImage = null
    this.isLoggedIn = false

    this.initPromise = this.store.isLoggedIn().then((b) => {
      this.isLoggedIn = b

      if (this.isLoggedIn) {
        this.store.getUserInfo().then((userInfo) => {
          this.username = userInfo.username
          this.profileImage = userInfo.profileImage
          this.panel.update()
        })
      }
    })

    this.store.masqEventTarget.addEventListener('store_logged_in', async () => {
      this.isLoggedIn = await this.store.isLoggedIn()
      const { username, profileImage } = await this.store.getUserInfo()
      this.username = username
      this.profileImage = profileImage
      this.panel.update()
    })

    this.store.masqEventTarget.addEventListener('store_logged_out', async () => {
      this.isLoggedIn = await this.store.isLoggedIn()
      this.panel.update()
    })
  }

  async init() {
    if (this.initPromise) {
      await this.initPromise
    }
  }
}
