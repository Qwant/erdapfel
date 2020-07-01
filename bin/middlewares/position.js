/* globals module */

module.exports = function() {
  const position = [7.2, 43.7];
  return function(req, res, next) {
    res.locals.position = position;
    next();
  };
};
