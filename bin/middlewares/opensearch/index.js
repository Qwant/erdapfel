const path = require('path')

module.exports =function(config) {
  return function (req, res) {
    res.set('Content-Type', 'text/xml')

    res.render(path.join(__dirname, 'os.ejs'), {
      shortName: res.locals._('QM'),
      description: res.locals._('Search with Qwant Map'),
      url: `${req.get('host')}${config.system.baseUrl}`,
      faviconUrl: `${req.get('host')}${config.system.baseUrl}statics/images/favicon.png`
    })
  }
}
