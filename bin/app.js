const express = require('express')
const yaml = require('node-yaml')
const path = require('path')
const expressStaticGzip = require('express-static-gzip')
const bunyan = require('bunyan')
const finalhandler = require('finalhandler');
const promClient = require('prom-client');
const fakePbf = require('./middlewares/fake_pbf/index')
const compression = require('compression')

const mapStyle = require('./middlewares/map_style');

const app = express()
const logger = bunyan.createLogger({
    name: 'erdapfel',
    stream: process.stdout,
    level: 'info',
    serializers: {
      req: bunyan.stdSerializers.req,
      err: bunyan.stdSerializers.err,
    }
});
const promRegistry = new promClient.Registry();

function App(config) {
  const constants = yaml.readSync('../config/constants.yml')
  const languages = constants.languages

  this.handler = null
  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, '..', 'views'));


  /* Define child logger in req */
  app.use((req,res,next) => {
    req.logger = logger.child({req: req});
    next()
  })

  /* Set in res the user lang config */
  const userLanguage = require('./middlewares/user_language')(languages)
  app.use(userLanguage)

  /* Trust local proxies, to get the correct requested 'host' */
  app.set('trust proxy', ['loopback', 'uniquelocal'])

  /* initialize gettext with correct dictionary */
  const gettext = require('./gettext_wrapper')(app, languages.supportedLanguages) /* set _ et _n as locals app methods */
  app.use(gettext)

  const publicDir = path.join(__dirname, '..', 'public')

  app.use('/statics/build/javascript/map_plugins', expressStaticGzip(path.join(publicDir, 'build', 'javascript', 'map_plugins'), {
    fallthrough: false,
    maxAge: config.mapPlugins.maxAge
  }))

  app.use('/mapstyle', expressStaticGzip(path.join(publicDir, 'mapstyle'), {
    fallthrough: false,
    maxAge: config.mapStyle.maxAge
  }))

  if(config.performance.enable) {
    app.get('/fake_pbf/:z/:x/:y.pbf', fakePbf)
  }

  app.use('/statics', expressStaticGzip(path.join(publicDir), {
    fallthrough: false,
    maxAge: config.statics.maxAge
  }))

  app.use('/style.json',
    compression(),
    new mapStyle(config, languages))

  if(config.server.enablePrometheus){
    app.get('/metrics', (req, res) => {
      res.set('Content-Type', promRegistry.contentType);
      res.end(promRegistry.metrics());
    });
  }
  else{
    app.get('/metrics', (req, res) => {
      res.sendStatus(404)
    })
  }

  const ogMeta = new require('./middlewares/og_meta')(config)
  app.get('/*', ogMeta, (req, res) => {
      res.render('index', {config : config})
  })

  if(config.server.acceptPostedLogs){
    app.post('/logs',
      express.json({strict: true, limit: config.server.maxBodySize}),
      (req, res) => {
        if(Object.keys(req.body).length === 0){
          res.sendStatus(400)
        }
        else{
          res.sendStatus(204)
          req.logger.info({body: req.body}, 'Received client log')
        }
    })

    if(config.server.acceptPostedEvents){
      const metricsBuilder = require('./metrics_builder')
      metricsBuilder(app, config, promRegistry)
    }
  }

  app.use((err, req, res, next) => {
    finalhandler(req, res, {
      onerror: req.logger.error({err: err})
    })(err)
  })
}

App.prototype.start = function (port) {
  return new Promise((resolve) => {
    this.handler = app.listen(port, () => {
      logger.info(`Server listening on PORT : ${port}`)
      resolve()
    })
  })
}

App.prototype.close = function() {
  if(this.handler) {
    this.handler.close()
    this.handler = null
  } else {
    logger.error('App handler does\'nt handle anything : can\'t stop')
  }
}

module.exports = App
