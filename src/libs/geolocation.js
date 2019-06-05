const geolocationPermissions = {
  PROMPT: 'prompt',
  GRANTED: 'granted',
  DENIED: 'denied'
}

export default class GeolocationCheck {
  static async checkPrompt(successCallback, errorCallback) {
    window.navigator.permissions && window.navigator.permissions.query({ name: 'geolocation' }).then(p => {
      if (p.state === geolocationPermissions.PROMPT) {
        let callback = () => {
          window.navigator.geolocation.getCurrentPosition(() => {
              if (typeof successCallback === "function") {
                successCallback()
              }
            }, error => {
              if (error.code !== 1) {
                fire('open_geolocate_not_activated_modal')
              }
              if (typeof errorCallback === "function") {
                errorCallback(error)
              }
            })
        }

        if (window._GEO_QUESTION_ASKED !== true) {
          window._GEO_QUESTION_ASKED = true
          fire('open_geolocate_modal', callback)
        } else {
          callback()
        }
      } else {
        if (typeof successCallback === "function") {
          successCallback()
        }
      }
    })
  }
}
