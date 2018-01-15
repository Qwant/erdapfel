const loader = require('../index')
const fs = require('fs')
const webpackStub = {
  context : __dirname,
  query : {
    conf: __dirname + '/../../../config/map_dev.json',
    outPath : __dirname + '/../../../public/'
  }
}
const source = fs.readFileSync(__dirname + '/style.json')

console.log(loader.call(webpackStub, source).toString())