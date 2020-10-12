import { openAndWaitForClose } from 'src/modals/GeolocationModal';
import { fire } from 'src/libs/customEvents';

const geolocationPermissions = {
  PROMPT: 'prompt',
  GRANTED: 'granted',
  DENIED: 'denied',
};

let hasPermissionModalOpenedOnce = false;

export async function showGeolocationModalIfNeeded() {
  if (!window.navigator.permissions) {
    // Some browsers (Safari, etc) do not implement Permissions API
    return;
  }

  const p = await window.navigator.permissions.query({ name: 'geolocation' });
  if (p.state !== geolocationPermissions.PROMPT) {
    // allowed on denied
    return;
  }

  if (hasPermissionModalOpenedOnce === true) {return;}
  hasPermissionModalOpenedOnce = true;
  await openAndWaitForClose();
}

export function handleError(error) {
  if (error.code === 1) {
    // PERMISSION_DENIED
    fire('open_geolocate_denied_modal');
  } else {
    fire('open_geolocate_not_activated_modal');
  }
}
