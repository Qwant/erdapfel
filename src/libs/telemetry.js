import Ajax from './ajax';
import nconf from '@qwant/nconf-getter';
import telemetryModule from '@qwant/telemetry';
import Error from '../adapters/error';

const telemetry = nconf.get().telemetry;
const system = nconf.get().system;
const telemtryEventUrl = 'events';
const uniqEventList = [];

export default class Telemetry {
  constructor() {}

  static add(event, type, source, data) {
    if (event) {
      if (type && source) {
        let event_const_name = `${(type + '_' + source + '_' + event).toUpperCase()}`;
        event = Telemetry[event_const_name];
      }
      return Telemetry.send(event, data);
    }
    Error.send('telemetry', 'add', 'telemetry event mismatch configuration', {});
  }

  static addOnce(event) {
    if (uniqEventList.indexOf(event) === -1) {
      uniqEventList.push(event);
      Telemetry.add(event);
    }
  }

  static async send(event, extra_data) {
    if (!telemetry.enabled) {
      return;
    } else if (typeof event === 'undefined') {
      Error.send('telemetry', 'send', 'unknown event received', {});
      return;
    }
    let data = {type: event};
    if (typeof extra_data === 'object' && extra_data !== null) {
      Object.keys(extra_data).forEach(key => {
        data[key] = extra_data[key];
      });
    }
    let telemetryUrl = `${system.baseUrl}${telemtryEventUrl}`;
    return Ajax.post(telemetryUrl, data);
  }

  static buildInteractionData({source, template, id, zone, element, category}) {
    const data = {
      'event': 'click',
      'component': 'local',
      'category': category || 'unknown',
      'type': source,
      'template': template,
      'zone': zone,
      'element': element,
      'item': id.startsWith('pj:') ? id.slice(3) : id,
    };
    return {
      'front_search_user_interaction_data': data,
    };
  }
}

// This converts "/src/libs/telemetry.js" events into a map where you can use an event as follow:
//
// 'app_start' event will be accessible like this "Telemetry.APP_START" and its value will be the
// original (so 'app_start').
telemetryModule.events.forEach(event => {
  Telemetry[event.toUpperCase()] = event;
});
