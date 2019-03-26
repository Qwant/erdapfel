import Ajax from './ajax'
import nconf from '@qwant/nconf-getter'
import telemetryModule from '@qwant/telemetry'
import Error from '../adapters/error'

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
      Error.send('telemetry', 'add', 'telemetry event mismatch configuration', {})
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
      return Ajax.post(telemetryUrl, data)
    }
  }
}

telemetryModule.events.forEach((event) => {
  Telemetry[event.toUpperCase()] = event
})
