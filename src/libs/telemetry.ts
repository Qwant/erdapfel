import Ajax from './ajax';
import nconf from '@qwant/nconf-getter';
import telemetryModule from '@qwant/telemetry';
import Error from '../adapters/error';
import IdunnPoi from 'src/adapters/poi/idunn_poi';

const telemetry = nconf.get().telemetry;
const system = nconf.get().system;
const telemetryEventUrl = 'events';
const uniqEventList: string[] = [];
const events = {};
const telemetryEvents: string[] = telemetryModule.events;
/*
  This converts "/src/libs/telemetry.js" events into a map where you can use an event as follow:
  'app_start' event will be accessible like this "Telemetry.APP_START" and its value will be the
  original (so 'app_start').
*/
telemetryEvents.forEach(event => {
  events[event.toUpperCase()] = event;
});

const addOnce = (event: string) => {
  if (uniqEventList.indexOf(event) === -1) {
    uniqEventList.push(event);
    add(event);
  }
};

const add = (event: string, extra_data?: object) => {
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
};

type InteractionDataProps = {
  source: string;
  template: string;
  id: string;
  zone: string;
  element: string;
  category?: string;
};

const buildInteractionData = ({
  source,
  template,
  id,
  zone,
  element,
  category,
}: InteractionDataProps) => {
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
    front_search_user_interaction_data: data,
  };
};

const sendPoiEvent = (poi: IdunnPoi | undefined, event: string, data: object) => {
  if (!poi?.meta || !poi?.meta.source) {
    return;
  }

  const eventName = `poi_${poi.meta?.source}_${event}`.toUpperCase();
  return add(events[eventName], data);
};

export default {
  add,
  addOnce,
  buildInteractionData,
  sendPoiEvent,
  ...events,
};
