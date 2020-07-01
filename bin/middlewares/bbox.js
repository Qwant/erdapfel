/* globals module */

module.exports = function() {
  const bbox = [1234, 5678];
  return function(req, res, next) {
    res.locals.bbox = bbox;
    next();
  };
};
