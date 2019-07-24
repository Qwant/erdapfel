import ServicePanelView from '../views/service_panel.dot';
import Panel from '../libs/panel';
import nconf from '../../local_modules/nconf_getter';
import CategoryService from '../adapters/category_service';
import PanelManager from 'src/proxies/panel_manager';

export default class ServicePanel {
  constructor() {
    this.panel = new Panel(this, ServicePanelView);
    this.categories = CategoryService.getCategories();
    this.mustDeployCategories = this.categories.length > 8;
    this.isDeployed = false;
    this.isDirectionActive = nconf.get().direction.enabled;
    this.active = true;
  }

  toggleCategories() {
    this.isDeployed = !this.isDeployed;
    this.panel.update();
  }

  openFavorite() {
    PanelManager.openFavorite();
  }

  openDirection() {
    if (this.isDirectionActive) {
      PanelManager.openDirection();
    }
  }

  toggle() {
    this.active = !this.active;
    this.panel.update();
  }

  open() {
    this.active = true;
    this.panel.update();
  }

  close() {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.panel.update();
  }

  openCategory(category) {
    PanelManager.openCategory({ category });
  }
}
