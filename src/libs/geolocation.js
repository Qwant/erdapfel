const geolocationPermissions = {
  PROMPT : 'prompt',
  GRANTED : 'granted',
  DENIED : 'denied'
}

export default class GeolocationCheck {
  static async checkPrompt() {
    window.navigator.permissions && window.navigator.permissions.query({ name: 'geolocation' }).then(p => {
      if (p.state === geolocationPermissions.PROMPT) {
        fire('open_geolocate_modal')
      }
    })
  }
}