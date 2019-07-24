import ApiPoi from '../adapters/poi/idunn_poi';
import ServicePanel from '../panel/service_panel';
import DirectionPanel from '../panel/direction/direction_panel';
import FavoritePanel from '../panel/favorites_panel';
import CategoryPanel from '../panel/category_panel';
import PoiPanel from '../panel/poi_panel';

class PanelManager {
  constructor() {
    this.panels = [];
  }

  async setPoi(poi, options = {}) {
    this.panels.forEach(panel => {
      if (panel.isPoiComplient) {
        panel.setPoi(poi, options);
      } else if (!options.isFromList && !options.isFromFavorite) {
        panel.close();
      }
    });
    window.app.unminify();
  }

  async loadPoiById(id, options) {
    if (id) {
      const poi = await ApiPoi.poiApiLoad(id);
      if (poi) {
        this.setPoi(poi, options);
      } else {
        this.resetLayout();
      }
      return poi;
    } else {
      this.resetLayout();
    }
  }

  emptyClickOnMap() {
    this.panels.forEach(p => {
      if (p.emptyClickOnMap) {
        p.emptyClickOnMap();
      }
    });
  }

  getDirectionPanel() {
    return this.panels.find(panel => panel instanceof DirectionPanel);
  }

  _openPanel(panelType, options) {
    /*
      "unminify" needs to be called before panel.open :
      DirectionPanel will minify the main search input (unused for Directions)
    */
    window.app.unminify();
    this.panels.forEach(panel => {
      if (panel instanceof panelType) {
        panel.open(options);
      } else {
        panel.close();
      }
    });
  }

  openDirection(options) {
    this._openPanel(DirectionPanel, options);
  }

  openFavorite() {
    this._openPanel(FavoritePanel);
  }

  openCategory(options) {
    this._openPanel(CategoryPanel, options);
  }

  resetLayout() {
    this._openPanel(ServicePanel);
  }

  async keepOnlyPoi() {
    this.panels.forEach(panel => {
      if (!(panel instanceof PoiPanel) && panel.active) {
        panel.close();
      }
    });
  }

  register(panel) {
    const existingPanel = this.panels.find(panelIterator => {
      return panelIterator.panel.cid === panel.panel.cid;
    });
    !existingPanel && this.panels.push(panel);
  }
}

export default new PanelManager();
