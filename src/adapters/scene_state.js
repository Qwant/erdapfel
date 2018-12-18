export default class SceneState {
  constructor() {
    this.poi = null
  }

  static getSceneState() {
    if(!window.__sceneState) {
      window.__sceneState = new SceneState()
    }
    return window.__sceneState
  }

  setPoiId(poi) {
    this.poi = poi
  }

  unsetPoiID() {
    this.poi = null
  }
}
