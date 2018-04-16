const sanitize = require('./src/sanitize')

module.exports = function(source) {
  if(this.cacheable) {
    this.cacheable()
  }
  return sanitize(source)
}
