import Ajax from './ajax'
import nconf from '@qwant/nconf-getter'
import telemetryModule from 'telemetry'

const telemetry = nconf.get().telemetry
const system = nconf.get().system
const telemtryEventUrl = 'events'
const uniqEventList = []

export default class Telemetry {
  constructor() {}

  static add(event) {
    if(event) {
      return Telemetry.send(event)
    } else {
      console.error('Telemetry event is missing')
    }
  }

  static addOnce(event) {
    if(uniqEventList.indexOf(event) === -1) {
      uniqEventList.push(event)
      Telemetry.add(event)
    }
  }

  static async send(event) {
    if(telemetry.enabled) {
      let data = {type : event}
      let telemetryUrl = `${system.baseUrl}${telemtryEventUrl}`
      return Ajax.post(telemetryUrl, data, {method : 'POST'})
    }
  }
}

telemetryModule.events.forEach((event) => {
  Telemetry[event.toUpperCase()] = event
})
