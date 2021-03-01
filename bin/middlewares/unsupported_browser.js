/* globals module */

function isUnsupported(userAgent = '') {
  return userAgent.match('Trident'); // old IE detection
}

module.exports = function(req, res, next) {
  if (isUnsupported(req.headers['user-agent'])) {
    res.redirect(302, '/unsupported');
  } else {
    next();
  }
};
