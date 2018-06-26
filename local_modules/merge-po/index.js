const configBuilt = require('nconf-builder')
const languages = configBuilt.get().languages
const childProcess = require('child_process')
const path = require('path')

const messagesPath = path.join(__dirname, '..', '..', 'language', 'message')
languages.supportedLanguages.forEach((language) => {
  if(language.fallback) {
    const fallbackList = language.fallback.reduce((fallbacks, fallback) => {
      fallbacks.push(path.resolve(path.join(messagesPath, fallback)))
      return fallbacks
    }, [language.locale])
    mergePo(fallbackList, path.resolve(path.join(__dirname, '..', '..', )))
  } else {
      console.log('No fallback for ', language.code)
  }

})

function mergePo(fallbackList, dest) {
  childProcess.exec( `msgcat ${fallbackList.join()} -o ${dest} --use-first`, (error, out) => {
    if(error) {
      console.error(error)
    } else {
      console.log(out)
    }
  })
}
