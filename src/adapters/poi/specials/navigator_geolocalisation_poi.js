import Poi from "../poi";
import GeolocationCheck from "../../../libs/geolocation";
export const GEOLOCALISATION_NAME = 'geolocalisation'

export const navigatorGeolcationStatus = {PENDING : 'pending', FOUND : 'found', UNKNOWN : 'unknown'}

export default class NavigatorGeolocalisationPoi extends Poi {
  constructor() {
    super(GEOLOCALISATION_NAME, _('Your position', 'direction'))
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
      navigator.geolocation.getCurrentPosition((position) => {
        this.setPosition({lat : position.coords.latitude, lng : position.coords.longitude})
        resolve()
      })
    })
  }

  setPosition(latLng) {
    this.status = navigatorGeolcationStatus.FOUND
    this.latLon = latLng
  }

  toUrl() {
    return `latlon:${this.latLon.lat.toFixed(6)}:${this.latLon.lng.toFixed(6)}`
  }

  render() {
    return `
      <div data-id="${GEOLOCALISATION_NAME}" data-val="${_('Your position', 'direction')}" class="autocomplete_suggestion itinerary_suggest_your_position">
        <div class="itinerary_suggest_your_position_icon icon-pin_geoloc"></div>
        ${_('Your position', 'direction')}
      </div>`
  }
}
