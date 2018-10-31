import Ajax from './ajax'
import nconf from '@qwant/nconf-getter'
import telemetryModule from 'telemetry'

const telemetry = nconf.get().telemetry

export default class Telemetry {
  constructor(event) {
    this.event = event
  }

  add() {
    this.send()
  }

  async send() {
    let data = {type : this.event}
    let telemetryUrl = `${telemetry.eventEndpoint}`
    Ajax.query(telemetryUrl, data, {method : 'POST'})
  }
}

telemetryModule.events.forEach((event) => {
  Telemetry[event.toUpperCase()] = event
})
