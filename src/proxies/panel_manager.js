import Poi from "../mapbox/poi";

function PanelManager() {}

PanelManager.init = function () {
  window.__panel_manager = {panels : [], listeners : []}
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

PanelManager.registerListener = function (listener) {
  window.__panel_manager.listeners.push(listener)
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
    let poi = await Poi.poiApiLoad(id)
    if(poi) {
      PanelManager.setPoi(poi, options)
    } else {
      PanelManager.closeAll()
    }
    return poi
  } else {
    PanelManager.closeAll()
  }
}

PanelManager.toggleFavorite = async function () {
  __panel_manager.panels.find((panel) => {
    if(panel.isFavoritePanel) {
      panel.toggle()
    } else if(panel.active) {
      panel.close()
    }
  })
}

PanelManager.closeAll = function() {
  __panel_manager.panels.forEach((panel) => {
    panel.close()
  })
}

PanelManager.register = function(panel) {
  let existingPanel = __panel_manager.panels.find((panelIterator) => {
    return panelIterator.panel.cid === panel.panel.cid
  })
  !existingPanel && __panel_manager.panels.push(panel)
}

export default PanelManager
