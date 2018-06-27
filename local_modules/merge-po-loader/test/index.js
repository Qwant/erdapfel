const merge = require('../index')
const fs = require('fs')

const file = fs.readFileSync(__dirname + '/fr_FR.po')

const webpackMock = {
  query :  {locale : 'fr_FR', fallback : ['br_FR']},
  async : function () {
    return function (data) {
      return data
    }
  }
}

merge.call(webpackMock, file).then((data) => {
  console.log(data)
})