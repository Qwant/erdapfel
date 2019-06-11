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
  window.__panel_manager.panels.forEach((panel) => {
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
    let poi = await ApiPoi.poiApiLoad(id);
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
  window.__panel_manager.panels.forEach((p) => {
    if (p.emptyClickOnMap) {
      p.emptyClickOnMap();
    }
  });
};

PanelManager.getDirectionPanel = function() {
  return window.__panel_manager.panels.find(panel => panel instanceof DirectionPanel);
};

PanelManager.openDirection = async function(options) {
  /*
    "unminify" needs to be called before panel.open :
    DirectionPanel will minify the main search input (unused for Directions)
  */
  window.app.unminify();
  window.__panel_manager.panels.find((panel) => {
    if (panel instanceof DirectionPanel) {
      if (!panel.active) {
        panel.open(options);
      }
    } else if (panel.active) {
      panel.close();
    }
  });
};

PanelManager.openFavorite = async function() {
  window.__panel_manager.panels.forEach((panel) => {
    if (panel instanceof FavoritePanel) {
      if (!panel.active) {
        panel.open();
      }
    } else if (panel.active) {
      panel.close();
    }
  });
  window.app.unminify();
};

PanelManager.openCategory = async function(options) {
  window.__panel_manager.panels.forEach((panel) => {
    if (panel instanceof CategoryPanel) {
      panel.open(options);
    } else if (panel.active) {
      panel.close();
    }
  });
  window.app.unminify();
};

PanelManager.keepOnlyPoi = async function() {
  window.__panel_manager.panels.forEach((panel) => {
    if (!(panel instanceof PoiPanel) && panel.active) {
      panel.close();
    }
  });
};

PanelManager.resetLayout = function() {
  window.__panel_manager.panels.forEach((panel) => {
    if (panel instanceof ServicePanel) {
      panel.open();
    } else {
      panel.close();
    }
  });
  window.app.unminify();
};

PanelManager.register = function(panel) {
  let existingPanel = window.__panel_manager.panels.find((panelIterator) => {
    return panelIterator.panel.cid === panel.panel.cid;
  });
  !existingPanel && window.__panel_manager.panels.push(panel);
};

window.PanelManager = PanelManager;
