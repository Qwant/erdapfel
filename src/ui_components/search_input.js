import Suggest from "../adapters/suggest";
import PanelManager from "../proxies/panel_manager";
import BragiPoi from "../adapters/poi/bragi_poi";

export default class SearchInput {
  constructor(tagSelector) {
    this.suggest = new Suggest(tagSelector, (selectedPoi) => this.selectItem(selectedPoi))

    listen('submit_autocomplete', async () => {
      this.suggest.onSubmit()
    })
  }

  async selectItem (selectedPoi) {
    if(selectedPoi) {
      fire('fit_map', selectedPoi, {sidePanelOffset : selectedPoi.type === 'poi'})
      fire('map_mark_poi', selectedPoi)
      if(selectedPoi.type === 'poi') {
        PanelManager.loadPoiById(selectedPoi.id)
      } else {
        PanelManager.closeAll()
      }
    }
  }
}
