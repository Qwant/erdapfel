import { openAndWaitForClose } from 'src/modals/GeolocationModal';
import { fire } from 'src/libs/customEvents';

const geolocationPermissions = {
  PROMPT: 'prompt',
  GRANTED: 'granted',
  DENIED: 'denied',
};

export default class GeolocationCheck {
  static async checkPrompt(successCallback = () => {}) {
    if (!window.navigator.permissions) {
      // Some browsers (Safari, etc) do not implement Permissions API
      return successCallback();
    }

    return window.navigator.permissions.query({ name: 'geolocation' }).then(async p => {
      if (p.state === geolocationPermissions.PROMPT) {
        if (window._GEO_QUESTION_ASKED !== true) {
          window._GEO_QUESTION_ASKED = true;
          await openAndWaitForClose();
        }
      }
      return successCallback();
    });
  }

  static handleError(error) {
    if (error.code === 1) {
      // PERMISSION_DENIED
      fire('open_geolocate_denied_modal');
    } else {
      fire('open_geolocate_not_activated_modal');
    }
  }
}
