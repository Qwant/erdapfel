/* globals require, process, __dirname, module */

const express = require('express');
const yaml = require('node-yaml');
const path = require('path');
const expressStaticGzip = require('express-static-gzip');
const bunyan = require('bunyan');
const finalhandler = require('finalhandler');
const promClient = require('prom-client');
const fakePbf = require('./middlewares/fake_pbf/index');
const compression = require('compression');
const mapStyle = require('./middlewares/map_style');
const getReqSerializer = require('./serializers/request');

const app = express();
const promRegistry = new promClient.Registry();

function App(config) {
  const openSearch = require('./middlewares/opensearch/index')(config);
  const constants = yaml.readSync('../config/constants.yml');
  const languages = constants.languages;
  const router = express.Router();

  this.logger = bunyan.createLogger({
    name: 'erdapfel',
    stream: process.stdout,
    level: process.env.NODE_ENV === 'test' ? 'warn' : 'info',
    serializers: {
      req: getReqSerializer(config),
      err: bunyan.stdSerializers.err,
    },
  });
  this.handler = null;
  app.set('view engine', 'ejs');
  app.locals.rmWhitespace = true;
  app.set('views', path.join(__dirname, '..', 'views'));


  /* Define child logger in req */
  app.use((req, res, next) => {
    req.logger = this.logger.child({ req });
    next();
  });

  /* Set in res the user lang config */
  const userLanguage = require('./middlewares/user_language')(languages);
  app.use(userLanguage);

  /* Trust local proxies, to get the correct requested 'host' */
  app.set('trust proxy', ['loopback', 'uniquelocal']);

  /* initialize gettext with correct dictionary */
  // set _ et _n as locals app methods
  const gettext = require('./gettext_wrapper')(app, languages.supportedLanguages);
  app.use(gettext);

  const publicDir = path.join(__dirname, '..', 'public');

  router.use('/statics/build/javascript/map_plugins', expressStaticGzip(
    path.join(publicDir, 'build', 'javascript', 'map_plugins'),
    {
      fallthrough: false,
      maxAge: config.mapPlugins.maxAge,
    },
  ));

  router.use('/mapstyle', expressStaticGzip(path.join(publicDir, 'mapstyle'), {
    fallthrough: false,
    maxAge: config.mapStyle.maxAge,
  }));

  router.use('/opensearch.xml', openSearch);

  if (config.performance.enabled) {
    router.get('/fake_pbf/:z/:x/:y.pbf', fakePbf);
  }

  router.use('/statics', expressStaticGzip(path.join(publicDir), {
    fallthrough: false,
    maxAge: config.statics.maxAge,
    setHeaders: (res, path, _stat) => {
      if (path.endsWith('/favicon.png')) {
        /* Chrome Mobile reloads favicon on each map move */
        res.set('Cache-Control', 'public, max-age=300');
      }
    },
  }));

  router.use('/style.json',
    compression(),
    new mapStyle(config, languages));

  if (config.server.enablePrometheus) {
    router.get('/metrics', (req, res) => {
      res.set('Content-Type', promRegistry.contentType);
      res.end(promRegistry.metrics());
    });
  } else {
    router.get('/metrics', (req, res) => {
      res.sendStatus(404);
    });
  }

  const ogMeta = new require('./middlewares/og_meta')(config);
  router.get('/*', ogMeta, (req, res) => {
    res.render('index', { config });
  });

  if (config.server.acceptPostedLogs) {
    router.post('/logs',
      express.json({ strict: true, limit: config.server.maxBodySize }),
      (req, res) => {
        if (Object.keys(req.body).length === 0) {
          res.sendStatus(400);
        } else {
          res.sendStatus(204);
          req.logger.info({ body: req.body }, 'Received client log');
        }
      });

    if (config.server.acceptPostedEvents) {
      const metricsBuilder = require('./metrics_builder');
      metricsBuilder(router, config, promRegistry);
    }
  }

  app.use(config.server.routerBaseUrl, router);

  app.use((err, req, res, _next) => {
    finalhandler(req, res, {
      onerror: req.logger.error({ err }),
    })(err);
  });
}

App.prototype.start = function(port) {
  return new Promise(resolve => {
    this.handler = app.listen(port, () => {
      this.logger.info(`Server listening on PORT : ${port}`);
      resolve();
    });
  });
};

App.prototype.close = function() {
  if (this.handler) {
    this.handler.close();
    this.handler = null;
  } else {
    this.logger.error('App handler does\'nt handle anything : can\'t stop');
  }
};

module.exports = App;
