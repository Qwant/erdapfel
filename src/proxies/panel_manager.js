import Poi from "../mapbox/poi";

function PanelManager() {}
PanelManager.init = function () {
  window.__panel_manager = {panels : [], listeners : []}
}

PanelManager.setPoi = async function(poi, options) {
  PanelManager.initLoad()
  __panel_manager.panels.forEach((panel) => {
    if(panel.isPoiComplient) {
      panel.setPoi(poi, options)

    } else {
      if(panel.isDisplayed()) {
        panel.close()
      }
    }
  })
  PanelManager.endLoad()
}

PanelManager.registerListener = function (listener) {
  window.__panel_manager.listeners.push(listener)
}

PanelManager.notify = function () {
  window.__panel_manager.listeners.forEach((listener) => {
    listener.notify()
  })
}

PanelManager.getPanels = function() {
  return __panel_manager.panels
}

PanelManager.restorePoi = function() {
  PanelManager.initLoad()
  __panel_manager.panels.forEach((panel) => {
    if(panel.isPoiComplient) {
      panel.toggle()
    } else if(panel.isDisplayed()){
      panel.close()
    }
  })
  PanelManager.endLoad()
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
  PanelManager.initLoad()
  __panel_manager.panels.find((panel) => {
    if(panel.isFavoritePanel) {
      panel.toggle()
    } else if(panel.active) {
      panel.close()
    }
  })

  PanelManager.endLoad()
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

PanelManager.initLoad = function () {
  document.querySelectorAll('.loading_panel').forEach((loadingPanel) => {
    loadingPanel.style.display = 'block'
    loadingPanel.style.animation = 'appear 0s forwards'
  })
}

PanelManager.endLoad = function () {
  document.querySelectorAll('.loading_panel').forEach((loadingPanel) => {
    loadingPanel.style.animation = 'disappear 1s forwards'
  })
  setTimeout(() => {
    document.querySelectorAll('.loading_panel').forEach((loadingPanel) => {
      loadingPanel.style.display = 'none'
    })
  }, 1000)
}

export default PanelManager
