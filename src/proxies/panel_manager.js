import ApiPoi from '../adapters/poi/idunn_poi';
import ServicePanel from '../panel/service_panel';
import DirectionPanel from '../panel/direction/direction_panel';
import FavoritePanel from '../panel/favorites_panel';
import CategoryPanel from '../panel/category_panel';
import PoiPanel from '../panel/poi_panel';

function PanelManager() {}

PanelManager.init = function() {
  window.__panel_manager = {panels: []};
};

PanelManager.setPoi = async function(poi, options = {}) {
  window.__panel_manager.panels.forEach(panel => {
    if (panel.isPoiComplient) {
      panel.setPoi(poi, options);
    } else if (!options.isFromList && !options.isFromFavorite) {
      panel.close();
    }
  });
  window.app.unminify();
};

PanelManager.loadPoiById = async function(id, options) {
  if (id) {
    const poi = await ApiPoi.poiApiLoad(id);
    if (poi) {
      PanelManager.setPoi(poi, options);
    } else {
      PanelManager.resetLayout();
    }
    return poi;
  } else {
    PanelManager.resetLayout();
  }
};

PanelManager.emptyClickOnMap = function() {
  window.__panel_manager.panels.forEach(p => {
    if (p.emptyClickOnMap) {
      p.emptyClickOnMap();
    }
  });
};

PanelManager.getDirectionPanel = function() {
  return window.__panel_manager.panels.find(panel => panel instanceof DirectionPanel);
};

function openPanel(panelType, options) {
  /*
    "unminify" needs to be called before panel.open :
    DirectionPanel will minify the main search input (unused for Directions)
  */
  window.app.unminify();
  window.__panel_manager.panels.forEach(panel => {
    if (panel instanceof panelType) {
      panel.open(options);
    } else {
      panel.close();
    }
  });
}

PanelManager.openDirection = function(options) {
  openPanel(DirectionPanel, options);
};

PanelManager.openFavorite = function() {
  openPanel(FavoritePanel);
};

PanelManager.openCategory = function(options) {
  openPanel(CategoryPanel, options);
};

PanelManager.resetLayout = function() {
  openPanel(ServicePanel);
};

PanelManager.keepOnlyPoi = async function() {
  window.__panel_manager.panels.forEach(panel => {
    if (!(panel instanceof PoiPanel) && panel.active) {
      panel.close();
    }
  });
};

PanelManager.register = function(panel) {
  const existingPanel = window.__panel_manager.panels.find(panelIterator => {
    return panelIterator.panel.cid === panel.panel.cid;
  });
  !existingPanel && window.__panel_manager.panels.push(panel);
};

window.PanelManager = PanelManager;
