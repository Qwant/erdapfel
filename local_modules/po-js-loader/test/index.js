const fs = require('fs')
const assert = require('assert')
const poToJS = require('../index')

// stub cacheable method
poToJSWebPackStub = poToJS.bind({
  cacheable : () => {}
})

const enGB = fs.readFileSync(__dirname + '/en_GB.po')
const out = poToJSWebPackStub(enGB)

console.log('Begin test')

assert.equal(out, `i18nData = {
	getPlural : function(n) { nplurals=2; plural=(n != 1); return plural; },
	message : {"popup title":"popup title","image left":["images left","image left"]}
}`, 'unexpected file output')

console.log('1 test ok')
