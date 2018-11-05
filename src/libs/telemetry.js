import Ajax from './ajax'
import nconf from '@qwant/nconf-getter'
import telemetryModule from 'telemetry'

const telemetry = nconf.get().telemetry

export default class Telemetry {
  constructor() {}

  static add(event) {
    return Telemetry.send(event)
  }

  static async send(event) {
    let data = {type : event}
    let telemetryUrl = `${telemetry.eventEndpoint}`
    return Ajax.post(telemetryUrl, data, {method : 'POST'})
  }
}

telemetryModule.events.forEach((event) => {
  Telemetry[event.toUpperCase()] = event
})
