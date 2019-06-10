export default class SceneState {
  constructor() {
    this.poiId = null;
  }

  static getSceneState() {
    if (!window.__sceneState) {
      window.__sceneState = new SceneState();
    }
    return window.__sceneState;
  }

  setPoiId(poiId) {
    this.poiId = poiId;
  }

  unsetPoiID() {
    this.poiId = null;
  }

  isDisplayed(id) {
    return this.poiId === id;
  }
}
