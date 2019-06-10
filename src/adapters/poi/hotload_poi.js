import ApiPoi from './idunn_poi';

export default class HotLoadPoi extends ApiPoi {
  constructor() {
    super(window.hotLoadPoi);
  }
}
