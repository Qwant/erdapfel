const express = require('express')
const yaml = require('node-yaml')
const path = require('path')
const expressStaticGzip = require('express-static-gzip')

const app = express()

function App(config) {
  /* set in res the user lang config */

  const constants = yaml.readSync('../config/constants.yml')
  const languages = constants.languages

  const userLanguage = require('./middlewares/user_language')(languages)
  app.use(userLanguage)

  this.handler = null
  app.set('view engine', 'ejs')

  /* initialize gettext with correct dictionary */
  const gettext = require('./gettext_wrapper')(app, languages.supportedLanguages) /* set _ et _n as locals app methods */
  app.use(gettext)

  const ogMeta = new require('./middlewares/og_meta')(config)
  app.use(ogMeta)

  const publicDir = path.join(__dirname, '..', 'public')

  app.use('/mapstyle', expressStaticGzip(path.join(publicDir, 'mapstyle'), {
    fallthrough: false,
    maxAge: config.mapStyle.maxAge
  }))

  app.use('/statics', expressStaticGzip(path.join(publicDir), {
    fallthrough: false,
    maxAge: config.statics.maxAge
  }))

  app.get('/*', (req, res) => {
    res.render('index', {config : config})
  })
}

App.prototype.start = function (port) {
  return new Promise((resolve) => {
    this.handler = app.listen(port, () => {
      resolve()
    })
  })
}

App.prototype.close = function() {
  if(this.handler) {
    this.handler.close()
    this.handler = null
  } else {
    console.error('App handler does\'nt handle anything : can\'t stop')
  }
}

module.exports = App
