import Ajax from './ajax';
import nconf from '@qwant/nconf-getter';
import telemetryModule from '@qwant/telemetry';
import Error from '../adapters/error';

const telemetry = nconf.get().telemetry;
const system = nconf.get().system;
const telemetryEventUrl = 'events';
const uniqEventList = [];
const events = {};

/*
  This converts "/src/libs/telemetry.js" events into a map where you can use an event as follow:
  'app_start' event will be accessible like this "Telemetry.APP_START" and its value will be the
  original (so 'app_start').
*/
telemetryModule.events.forEach(event => {
  events[event.toUpperCase()] = event;
});

function addOnce(event) {
  if (uniqEventList.indexOf(event) === -1) {
    uniqEventList.push(event);
    add(event);
  }
}

function add(event, extra_data) {
  if (!telemetry.enabled) {
    return;
  }

  if (typeof event === 'undefined') {
    return Error.send('telemetry', 'send', 'unknown event received', {});
  }

  const telemetryUrl = `${system.baseUrl}${telemetryEventUrl}`;
  const data = { type: event };

  if (typeof extra_data === 'object' && extra_data !== null) {
    Object.keys(extra_data).forEach(key => {
      data[key] = extra_data[key];
    });
  }

  return Ajax.post(telemetryUrl, data);
}

function buildInteractionData({ source, template, id, zone, element, category }) {
  const data = {
    event: 'click',
    component: 'local',
    category: category || 'unknown',
    type: source,
    template,
    zone,
    element,
    item: id.startsWith('pj:') ? id.slice(3) : id,
  };

  return {
    'front_search_user_interaction_data': data,
  };
}

function sendPoiEvent(poi, event, data) {
  const eventName = `poi_${poi.meta?.source}_${event}`.toUpperCase();
  return add(events[eventName], data);
}

export default {
  add,
  addOnce,
  buildInteractionData,
  sendPoiEvent,
  ...events,
};
