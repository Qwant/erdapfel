import ApiPoi from "./api_poi";

export default class HotLoadPoi extends ApiPoi {
  constructor() {
    super(window.hotLoadPoi)
  }
}
