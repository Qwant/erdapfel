import ServicePanelView from '../views/service_panel.dot'
import Panel from '../libs/panel'
import PanelManager from "../proxies/panel_manager"
import PoiPanel from "./poi_panel"
import Favorite from "./favorites_panel"
import nconf from "../../local_modules/nconf_getter";


export default class ServicePanel{
  constructor() {
    this.panel = new Panel(this, ServicePanelView)
    this.isFavoriteActive = false
    this.isResultActive = false
    this.isDirectionActive = nconf.get().direction.enabled

    listen('toggle_burger', () => {
      this.panel.toggleClassName(.2,'.service_panel', 'service_panel--open')
    })
    PanelManager.registerListener(this)
  }


  toggleFavorite() {
    PanelManager.toggleFavorite()
  }

  toggleResult() {
    PanelManager.restorePoi()
  }

  toggleDirection() {
    if(this.isDirectionActive) {
      PanelManager.toggleDirection()
    }
  }
  /* PanelManager listener interface implementation */
  notify () {
    PanelManager.getPanels().forEach((panel) => {
      if(panel instanceof PoiPanel) {
        this.isResultActive = panel.isDisplayed()
      }
      if(panel instanceof Favorite) {
        this.isFavoriteActive = panel.isDisplayed()
      }
    })
    this.panel.update()
  }



}
