import { fire } from 'src/libs/customEvents';

export const geolocationPermissions = {
  PROMPT: 'prompt',
  GRANTED: 'granted',
  DENIED: 'denied',
  UNSUPPORTED: 'unsupported',
};

export async function getGeolocationPermission() {
  // Some browsers (Safari, etc) do not implement Permissions API
  if (!window.navigator.permissions) {
    return geolocationPermissions.UNSUPPORTED;
  }

  // granted or denied
  const p = await window.navigator.permissions.query({ name: 'geolocation' });
  return p.state;
}

export function handleError(error) {
  if (error.code === 1) {
    // PERMISSION_DENIED
    fire('open_geolocate_denied_modal');
  } else {
    fire('open_geolocate_not_activated_modal');
  }
}
