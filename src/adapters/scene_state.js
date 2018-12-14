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

  setPoi(poi) {
    this.poi = poi
  }

  unsetPoi() {
    this.poi = null
  }
}