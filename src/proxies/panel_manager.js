import Poi from "../mapbox/poi";

function PanelManager() {}
PanelManager.init = function () {
  window.__panel_manager = {panels : []}
}

PanelManager.setPoi = function(poi, options) {
  __panel_manager.panels.forEach((panel) => {
    if(panel.isPoiComplient) {
      panel.setPoi(poi, options)
    } else {
      panel.close()
    }
  })
}

PanelManager.getActive = function() {
  __panel_manager.panels.filter((panel) => {
    return panel.isActive()
  })
}

PanelManager.restorePoi = function() {
  __panel_manager.panels.forEach((panel) => {
    if(panel.isPoiComplient) {
      panel.toggle()
    } else {
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

PanelManager.toggleFavorite = function () {
  __panel_manager.panels.find((panel) => {
    if(panel.isFavoritePanel) {
      panel.toggle()
    } else {
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
