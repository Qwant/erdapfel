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
    } else if (!options.isFromList && !options.isFromFavorite){
      panel.close();
    }
  });
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

PanelManager.openDirection = async function() {
  window.__panel_manager.panels.find((panel) => {
    if (panel instanceof DirectionPanel) {
      if (!panel.active) {
        panel.open();
      }
    } else if (panel.active && !(panel instanceof DirectionPanel)) {
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
    } else if (panel.active && !(panel instanceof FavoritePanel)) {
      panel.close();
    }
  });
};

PanelManager.openCategory = async function(options) {
  window.__panel_manager.panels.forEach((panel) => {
    if (panel instanceof CategoryPanel) {
      panel.open(options);
    } else if (panel.active) {
      panel.close();
    }
  });
};

PanelManager.keepOnlyPoi = async function() {
  window.__panel_manager.panels.forEach((panel) => {
    if (!(panel instanceof PoiPanel) && panel.active) {
      panel.close();
    }
  });
};

PanelManager.toggleDirection = async function(options) {
  let openService = false;
  window.__panel_manager.panels.forEach((panel) => {
    if (panel instanceof DirectionPanel) {
      if (panel.active) {
        openService = true;
      }
      panel.toggle(options);
    } else if (panel.active) {
      panel.close();
    }
  });
  if (openService) {
    PanelManager.openService();
  }
};

PanelManager.toggleFavorite = async function() {
  let openService = false;
  window.__panel_manager.panels.forEach((panel) => {
    if (panel instanceof FavoritePanel) {
      if (panel.active) {
        openService = true;
      }
      panel.toggle();
    } else if (panel.active) {
      panel.close();
    }
  });
  if (openService) {
    PanelManager.openService();
  }
};

PanelManager.openService = function() {
  window.__panel_manager.panels.forEach((panel) => {
    if (panel instanceof ServicePanel) {
      panel.open();
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
};

PanelManager.register = function(panel) {
  let existingPanel = window.__panel_manager.panels.find((panelIterator) => {
    return panelIterator.panel.cid === panel.panel.cid;
  });
  !existingPanel && window.__panel_manager.panels.push(panel);
};

window.PanelManager = PanelManager;
