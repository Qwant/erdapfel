import ServicePanelView from '../views/service_panel.dot'
import Panel from '../libs/panel'
import PoiPanel from "./poi_panel"
import Favorite from "./favorites_panel"
import nconf from "../../local_modules/nconf_getter";
import categories from '../../config/categories.yml'
import Telemetry from '../libs/telemetry';

export default class ServicePanel{
  constructor() {
    this.panel = new Panel(this, ServicePanelView)
    this.categories = categories
    this.isFavoriteActive = false
    this.isResultActive = false
    this.isDirectionActive = nconf.get().direction.enabled
    this.active = true

    listen('toggle_burger', () => {
      this.panel.toggleClassName(.2,'.service_panel', 'service_panel--open')
    })
    PanelManager.register(this)
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

  toggle() {
    this.active = !this.active
    this.panel.update()
  }

  open() {
    this.active = true
    this.panel.update()
  }

  close() {
    this.active = false
    this.panel.update()
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

  openCategory(category) {
    Telemetry.add(Telemetry.POI_PJ_CATEGORY_OPEN)
    PanelManager.openCategory({ category })
  }
}
