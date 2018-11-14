import Ajax from './ajax'
import nconf from '@qwant/nconf-getter'
import telemetryModule from 'telemetry'

const telemetryEnabled = nconf.get().telemetryEnabled
const system = nconf.get().system
const telemtryEventUrl = 'events'

export default class Telemetry {
  constructor() {}

  static add(event) {
    return Telemetry.send(event)
  }

  static async send(event) {
    if(telemetryEnabled) {
      let data = {type : event}
      let telemetryUrl = `${system.baseUrl}${telemtryEventUrl}`
      console.log(telemetryUrl)
      return Ajax.post(telemetryUrl, data, {method : 'POST'})
    }
  }
}

telemetryModule.events.forEach((event) => {
  Telemetry[event.toUpperCase()] = event
})
