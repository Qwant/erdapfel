import Suggest from "../adapters/suggest";
import PanelManager from "../proxies/panel_manager";
import BragiPoi from "../adapters/poi/bragi_poi";

export default class SearchInput {
  constructor(tagSelector) {
    this.suggest = new Suggest(tagSelector, (selectedPoi) => this.selectItem(selectedPoi))

    listen('submit_autocomplete', async () => {
      if (this.suggest.pending) {
        this.suggest.searchInputDomHandler.blur()
        let term = this.suggest.searchInputDomHandler.value
        let suggestList = await BragiPoi.get(term)
        if (suggestList.length > 0) {
          let firstPoi = suggestList[0]
          this.suggest.select(firstPoi)
        }
      } else {
        if (this.suggest.suggestList && this.suggest.suggestList.length > 0
          && this.suggest.searchInputDomHandler.value && this.suggest.searchInputDomHandler.value.length > 0) {
          this.selectItem(this.suggest.suggestList[0])
        }
      }
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
