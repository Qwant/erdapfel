import Suggest from "../adapters/suggest";
import NavigatorGeolocalisationPoi, {navigatorGeolcationStatus} from "../adapters/poi/specials/navigator_geolocalisation_poi";
import PoiStore from "../adapters/poi/poi_store";

import Error from '../adapters/error'
export default class DirectionInput {
  constructor(tagSelector, select, submitHandler) {
    this.select = select
    this.submitHandler = submitHandler
    this.geolocalisationPoi = NavigatorGeolocalisationPoi.getInstance()
    let prefixes = [
      this.geolocalisationPoi
    ]

    this.suggest = new Suggest(tagSelector, (selectedPoi) => this.selectItem(selectedPoi), prefixes, 'direction_suggestions')
    PoiStore.getAll().then((storeItems) => {
      this.suggest.preRender(storeItems)
    })
    this.listenHandler = listen(submitHandler, () => this.onSubmit())
  }

  onSubmit() {
    this.suggest.onSubmit()
  }

  async selectItem(selectedPoi) {
    if(selectedPoi instanceof NavigatorGeolocalisationPoi) {
      this.suggest.setIdle(true)
      try {
        await selectedPoi.geolocate()
      } catch(error) {
        if(selectedPoi.status === navigatorGeolcationStatus.FORBIDDEN) {
          fire('open_geolocate_denied_modal')
        } else {
          Error.sendOnce('direction_input', 'selectItem', 'error getting user location', error)
        }
        this.suggest.clear()
      }
      if(selectedPoi.status === navigatorGeolcationStatus.FOUND) {
        this.select(selectedPoi)
      }
      this.suggest.setIdle(false)
    } else {
      this.select(selectedPoi)
    }
  }

  destroy() {
    if(this.suggest) {
      unListen(this.listenHandler)
      this.suggest.destroy()
      this.suggest = null
    }
  }

  getValue() {
    return this.suggest.getValue()
  }

  setValue(value) {
    this.suggest.setValue(value)
  }

}
