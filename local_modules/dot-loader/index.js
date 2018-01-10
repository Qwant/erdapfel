var dot = require('dot');
var fs = require('fs');

module.exports = function(content) {
  if (this.cacheable) {
    this.cacheable();
  }

  dot.templateSettings.selfcontained = true;

  var content = fs.readFileSync(this.resourcePath);
  return "templates = " + dot.template(content);
};