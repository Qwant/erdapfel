const express = require('express')
const promClient = require('prom-client')
const events = require('@qwant/telemetry').events
module.exports = (app, config, registry) => {
  const counters = {}
  events.forEach(eventType => {
    counters[eventType] = new promClient.Counter({
      name: `erdapfel_${eventType}_count`,
      help: eventType,
      registers: [registry]
    })
  })

  app.post('/events',
    express.json({strict: true, limit: config.server.maxBodySize}),
    (req, res) => {
      const eventType = req.body.type
      if(eventType && counters[eventType]){
        counters[eventType].inc()
        res.sendStatus(204)
      }
      else{
        res.sendStatus(400)
      }
    }
  )
}
