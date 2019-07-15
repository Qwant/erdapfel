/* globals require, module, __dirname */

const path = require('path');

module.exports = function(config) {
  return function(req, res) {
    res.set('Content-Type', 'text/xml');

    res.render(path.join(__dirname, 'os.ejs'), {
      shortName: res.locals._('Qwant Maps'),
      description: res.locals._('Search with Qwant Maps'),
      baseUrl: `${req.get('host')}${config.system.baseUrl}`,
    });
  };
};
