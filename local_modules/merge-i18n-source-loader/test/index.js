const fs = require('fs')
const merge = require('../src/merge_source')

let source = fs.readFileSync(__dirname + '/en_GB.js').toString()
let date = {path : __dirname + '/date-en_gb.json', name : 'datePointer'}

merge(source, [date]).then((data) => {
  let error = false
  try {
    eval(data.toString())
    if(datePointer.monthNames.length > 0) {
      console.log(' 1 / 2 Date correctly inserted')
    } else {
      console.error(' 1 / 2 Date missing')
      error = true
    }
    if(i18nData.getPlural(0) === true) {
      console.log(' 2 / 2 getPlural inserted')
    } else {
      console.error('2 / 2 getPlural missing')
    }
  } catch (e) {
    console.log(e)
  }
  if(error) {
    throw 'Test not ok'
  }
})