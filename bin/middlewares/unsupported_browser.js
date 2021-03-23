function isUnsupported(userAgent = '') {
  return userAgent.match('Trident'); // old IE detection
}

module.exports = function (config) {
  const redirect = config.server.unsupportedBrowsers.redirect;

  return function (req, res, next) {
    if (redirect && isUnsupported(req.headers['user-agent'])) {
      res.redirect(302, config.system.baseUrl + 'unsupported');
    } else {
      next();
    }
  };
};
