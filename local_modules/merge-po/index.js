const yaml = require('node-yaml')
const childProcess = require('child_process')
const path = require('path')
const constants = yaml.readSync('../../config/constants.yml')
const languages = constants.languages

const messagesPath = path.join(__dirname, '..', '..', 'language', 'message')
languages.supportedLanguages.forEach((language) => {
  if(language.fallback) {
    const fallbackList = language.fallback.reduce((fallbacks, fallback) => {
      fallbacks.push(path.resolve(path.join(messagesPath, `${fallback}.po`)))
      return fallbacks
    }, [path.resolve(path.join(messagesPath, `${language.locale}.po`))])
    mergePo(fallbackList, path.resolve(path.join(__dirname, '..', '..', 'language', 'merged_messages', `${language.locale}.po`)))
  } else {
      console.log('No fallback for ', language.locale)
  }
})

function mergePo(fallbackList, dest) {
  childProcess.exec( `msgcat ${fallbackList.join(' ')} -o ${dest} --use-first`, (error, out) => {
    if(error) {
      console.error(error)
    } else {
      console.log(out)
    }
  })
}
