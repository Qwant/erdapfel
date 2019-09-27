/* eslint-disable no-irregular-whitespace */

export function formatDuration(sec) {
  sec = Math.max(60, sec); // For duration < 60s, return '1 min'
  let min = Math.round(sec / 60);

  if (min < 60) {
    return `${min} min`;
  }

  const hour = Math.floor(min / 60);
  min = min - 60 * hour;
  let ret = `${hour} h`;
  if (min > 0 && hour < 10) {
    ret += ` ${min < 10 ? '0' : ''}${min} min`;
  }
  return ret;
}

export function formatDistance(m) {
  if (m > 99000) {
    return `${Math.round(m / 1000)} km`;
  }
  if (m > 1000) {
    return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
  }
  if (m > 5) {
    return `${m.toFixed(0)} m`;
  }
  return '';
}

export function getVehicleIcon(vehicle) {
  switch (vehicle) {
  case 'driving':
    return 'icon-drive';
  case 'walking':
    return 'icon-foot';
  case 'cycling':
    return 'icon-bike';
  default:
    return '';
  }
}

export function getStepIcon(step) {
  return (step.maneuver.modifier || step.maneuver.type).replace(/\s/g, '-');
}
