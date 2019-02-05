import Poi from "../poi";
import GeolocationCheck from "../../../libs/geolocation";
export const GEOLOCALISATION_NAME = 'geolocalisation'

export const navigatorGeolcationStatus = {PENDING : 'pending', FOUND : 'found', UNKNOWN : 'unknown'}

export default class NavigatorGeolocalisationPoi extends Poi {
  constructor() {
    super(GEOLOCALISATION_NAME, GEOLOCALISATION_NAME)
    this.status = navigatorGeolcationStatus.UNKNOWN
  }

  static getInstance() {
    if(!window.__navigatorGeolocalisationPoi) {
      window.__navigatorGeolocalisationPoi = new NavigatorGeolocalisationPoi()
    }
    return window.__navigatorGeolocalisationPoi
  }

  getPosition() {
    GeolocationCheck.checkPrompt()
    return new Promise((resolve) => {
      this.status = navigatorGeolcationStatus.PENDING
      setTimeout(() => {
        navigator.geolocation.getCurrentPosition((position) => {
          this.status = navigatorGeolcationStatus.FOUND
          this.latLon = {lat : position.coords.latitude, lng : position.coords.longitude}
          resolve()
        })
      }, 5000)
    })
  }

  render() {
    return `
      <div data-id="${GEOLOCALISATION_NAME}" data-val="${_('Your position', 'direction')}" class="autocomplete_suggestion itinerary_suggest_your_position">
        <div class=itinerary_suggest_your_position_icon></div>
        ${_('Your position', 'direction')}
      </div>`
  }
}
