import ServicePanelView from '../views/service_panel.dot';
import Panel from '../libs/panel';
import nconf from '@qwant/nconf-getter';
import CategoryService from '../adapters/category_service';

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
    window.app.openFavorite();
  }

  openDirection() {
    if (this.isDirectionActive) {
      window.app.openDirection();
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
    window.app.openCategory({ category });
  }
}
