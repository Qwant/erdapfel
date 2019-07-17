/* globals require, module */

const express = require('express');
const { body, validationResult } = require('express-validator');
const promClient = require('prom-client');
const events = require('@qwant/telemetry').events;

module.exports = (app, config, registry) => {
  const counters = {};
  events.forEach(eventType => {
    counters[eventType] = new promClient.Counter({
      name: `erdapfel_${eventType}_count`,
      help: eventType,
      registers: [registry],
    });
  });

  app.post('/events',
    express.json({strict: true, limit: config.server.maxBodySize}),
    [
      body('type')
        .isString()
        .custom(eventType => {
          if (!counters[eventType]) {
            throw new Error('Unknown event type');
          }
          return true;
        }),
    ], (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      res.sendStatus(204);
      const eventType = req.body.type;
      counters[eventType].inc();
      req.logger.info({telemetry: req.body}, 'Received telemetry event');
    }
  );
};
