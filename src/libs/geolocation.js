import { openAndWaitForClose } from 'src/modals/GeolocationModal';
import { fire } from 'src/libs/customEvents';
import { isMobileDevice } from 'src/libs/device';

const geolocationPermissions = {
  PROMPT: 'prompt',
  GRANTED: 'granted',
  DENIED: 'denied',
};

let hasPermissionModalOpenedOnce = false;

export async function showGeolocationModalIfNeeded() {
  if (!isMobileDevice()) {
    return false;
  }

  // Some browsers (Safari, etc) do not implement Permissions API
  if (!window.navigator.permissions) {
    return false;
  }

  // granted or denied
  const p = await window.navigator.permissions.query({ name: 'geolocation' });
  if (p.state !== geolocationPermissions.PROMPT) {
    return p.state === geolocationPermissions.GRANTED;
  }

  if (hasPermissionModalOpenedOnce === true) {return;}
  hasPermissionModalOpenedOnce = true;
  return await openAndWaitForClose();
}

export function handleError(error) {
  if (error.code === 1) {
    // PERMISSION_DENIED
    fire('open_geolocate_denied_modal');
  } else {
    fire('open_geolocate_not_activated_modal');
  }
}
