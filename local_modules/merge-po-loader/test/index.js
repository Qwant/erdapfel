const merge = require('../index')
const fs = require('fs')
const path = require('path')

const file = fs.readFileSync(__dirname + '/br_FR.po')

const webpackMock = {
  query : {fallbackPaths: [path.resolve(path.join(__dirname, 'fr_FR.po'))]}
}


let data = merge.call(webpackMock, file)

if(data.indexOf('msgstr "Ouvert en breton"') === -1) {
  console.log( 'Translation missing')
}