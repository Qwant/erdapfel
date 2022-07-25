/* global _ */
/* eslint-disable no-irregular-whitespace */
import { normalizeToFeatureCollection } from './geojson';

export function formatDuration(sec) {
  sec = Math.max(60, sec); // For duration < 60s, return '1 min'
  let min = Math.round(sec / 60);

  if (min < 60) {
    return `${min} min`;
  }

  const hour = Math.floor(min / 60);
  min = min - 60 * hour;
  let ret = `${hour} h`;
  if (hour < 10) {
    ret += ' ' + min.toString().padStart(2, '0');
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
  return `${m.toFixed(0)} m`;
}

export function getTransportTypeIcon({ mode = '' }) {
  if (mode.startsWith('WALK')) {
    return 'walk';
  }
  if (mode.startsWith('BUS')) {
    return 'bus';
  }
  if (mode.startsWith('SUBWAY')) {
    return 'metro';
  }
  if (mode.startsWith('TRAM')) {
    return 'tram';
  }
  if (mode.indexOf('TRAIN') !== -1) {
    return 'train';
  }
  return null;
}

export function getStepIcon(step) {
  if (step.maneuver.type === 'depart' || step.maneuver.type === 'arrive') {
    return step.maneuver.type;
  }
  return (step.maneuver.modifier || step.maneuver.type).replace(/\s/g, '-');
}

export function getAllSteps(route) {
  // Note: this is a flatMap operation
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#Alternative
  return route.legs.reduce((acc, leg) => acc.concat(leg.steps), []);
}

export function getAllStops(route) {
  return route.legs.reduce((acc, leg) => acc.concat(leg.stops), []);
}

const first = array => array && array[0];
const last = array => array && array[array.length - 1];

export const originDestinationCoords = route => {
  const fc = normalizeToFeatureCollection(route.geometry);
  const first_geo = first(fc.features).geometry;
  const last_geo = last(fc.features).geometry;

  const origin =
    first_geo.type === 'MultiLineString'
      ? first(first(first_geo.coordinates))
      : first(first_geo.coordinates);

  const destination =
    last_geo.type === 'MultiLineString'
      ? last(last(last_geo.coordinates))
      : last(last_geo.coordinates);

  return { origin, destination };
};

export const walkingManeuver = maneuver => {
  const stringifyModifier = {
    'sharp left': _('Turn left', 'direction'),
    left: _('Turn left', 'direction'),
    'slight left': _('Keep left', 'direction'),
    straight: _('Walk', 'direction'),
    'slight right': _('Keep right', 'direction'),
    right: _('Turn right', 'direction'),
    'sharp right': _('Turn right', 'direction'),
    uturn: _('Turn back', 'direction'),
  };

  const context = {
    modifier: stringifyModifier[maneuver.modifier],
    name: maneuver.detail.name,
  };

  return maneuver.detail.name ? _('{modifier} on {name}', 'direction', context) : context.modifier;
};
