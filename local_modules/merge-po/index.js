const childProcess = require('child_process')
const path = require('path')

module.exports = function (originalStream, fallbackList, messagePath) {

  let fallbackPaths = fallbackList.reduce((fallbackAcc, fallback) => {
    fallbackAcc.push(path.resolve(path.join(messagePath,`${fallback}.po`)))
    return fallbackAcc
  }, [])

  try {
    return childProcess.execSync( `msgcat - ${fallbackPaths.join(' ')} --use-first`, {input : originalStream})
  } catch (e) {
    throw(e)
  }
}