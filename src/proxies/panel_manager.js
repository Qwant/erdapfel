import ApiPoi from "../adapters/poi/idunn_poi";
import ServicePanel from "../panel/service_panel";
import DirectionPanel from "../panel/direction/direction_panel";
import PoiPanel from "../panel/poi_panel";

function PanelManager() {}

PanelManager.init = function () {
  window.__panel_manager = {panels : []}
}

PanelManager.setPoi = async function(poi, options) {
  __panel_manager.panels.forEach((panel) => {
    if(panel.isPoiComplient) {
      panel.setPoi(poi, options)
    } else {
      panel.close()
    }
  })
}

PanelManager.getPanels = function() {
  return __panel_manager.panels
}

PanelManager.restorePoi = function() {
  __panel_manager.panels.forEach((panel) => {
    if(panel.isPoiComplient) {
      panel.toggle()
    } else if(panel.isDisplayed()){
      panel.close()
    }
  })
}

PanelManager.loadPoiById = async function(id, options) {
  if(id) {
    let poi = await ApiPoi.poiApiLoad(id)
    if(poi) {
      PanelManager.setPoi(poi, options)
    } else {
      PanelManager.resetLayout()
    }
    return poi
  } else {
    PanelManager.resetLayout()
  }
}

PanelManager.openDirection = async function () {
  __panel_manager.panels.find((panel) => {
    if(panel.isDirectionPanel) {
      if(!panel.active) {
        panel.open()
      }
    } else if(panel.active && !panel.isDirectionPanel) {
      panel.close()
    }
  })
}

PanelManager.openFavorite = async function () {
  __panel_manager.panels.forEach((panel) => {
    if(panel.isFavoritePanel) {
      if(!panel.active) {
        panel.open()
      }
    } else if(panel.active && !panel.isFavoritePanel) {
      panel.close()
    }
  })
}

PanelManager.togglePoi = async function (options) {
  __panel_manager.panels.forEach((panel) => {
    if(panel instanceof PoiPanel) {
      panel.toggle(options)
    } else if(panel.active) {
      panel.close()
    }
  })
}

PanelManager.toggleDirection = async function (options) {
  __panel_manager.panels.forEach((panel) => {
    if(panel instanceof DirectionPanel) {
      panel.toggle(options)
    } else if(panel.active) {
      panel.close()
    }
  })
}

PanelManager.toggleFavorite = async function () {
  __panel_manager.panels.forEach((panel) => {
    if(panel.isFavoritePanel) {
      panel.toggle()
    } else if(panel.active) {
      panel.close()
    }
  })
}

PanelManager.openService = function() {
  __panel_manager.panels.forEach((panel) => {
    if(panel instanceof ServicePanel) {
      panel.open()
    }
  })
}

PanelManager.resetLayout = function() {
  __panel_manager.panels.forEach((panel) => {
    if(panel instanceof ServicePanel) {
      panel.open()
    } else {
      panel.close()
    }
  })
}

PanelManager.register = function(panel) {
  let existingPanel = __panel_manager.panels.find((panelIterator) => {
    return panelIterator.panel.cid === panel.panel.cid
  })
  !existingPanel && __panel_manager.panels.push(panel)
}

export default PanelManager
