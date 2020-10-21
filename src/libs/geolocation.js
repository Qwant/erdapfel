import { fire } from 'src/libs/customEvents';

// Show custom Modal when opening the Directions panel for the first time
// and if the browser's geolocation permission hasn't been granted yet
export async function isLocationAvailable() {

  // Some browsers (Safari, etc) do not implement Permissions API
  if (!window.navigator.permissions) {
    return false;
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
