function PanelManager() {}
PanelManager.init = function () {
  window.__panels = []
}

PanelManager.setPoi = function(poi) {
  __panels.forEach((panel) => {
    if(panel.isPoiComplient) {
      panel.setPoi(poi)
    } else {
      panel.close()
    }
  })
}

PanelManager.toggleFavorite = function () {
  __panels.find((panel) => {
    console.log(panel.isFavoritePanel)
    if(panel.isFavoritePanel) {
      panel.toggle()
    } else {
      panel.close()
    }
  })
}

PanelManager.closeAll = function() {
  __panels.forEach((panel) => {
    panel.close()
  })
}

PanelManager.register = function(panel) {
  let existingPanel = __panels.find((panelIterator) => {
    return panelIterator.panel.cid === panel.panel.cid
  })
  !existingPanel && __panels.push(panel)
}

export default PanelManager
