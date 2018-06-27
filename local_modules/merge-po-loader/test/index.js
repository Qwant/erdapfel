const merge = require('../index')
const fs = require('fs')
const path = require('path')

const file = fs.readFileSync(__dirname + '/br_FR.po')

const webpackMock = {
  query :  {fallbackPaths: [path.resolve(path.join(__dirname, 'fr_FR.po'))]},
  async : function () {
    return function (error, data) {
      console.log(data.toString())
      if(data.indexOf('msgstr "Ouvert en breton"') !== -1) {
        console.log( 'Translation missing')
      }
    }
  }
}

merge.call(webpackMock, file)
