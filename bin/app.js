const express = require('express')
const app = express()

function App(config) {
  /* set in res the user lang config */
  const lang = require('./middlewares/lang')(languagesConfig)
  app.use(lang)

  this.handler = null
  app.set('view engine', 'ejs')

  /* initialize gettext with correct dictionary */
  const gettext = require('./gettext')(app, config.languages.supportedLanguages) /* set _ et _n as locals app methods */
  app.use(gettext)

  app.use(express.static(`${__dirname}/../public`))
  app.get('/*', (req, res) => {
    res.render('index', {config : config})
  })

  app.use((error, req, res, next) => {
    res.status(500).render('error', {error})
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
