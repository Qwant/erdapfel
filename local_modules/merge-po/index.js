const childProcess = require('child_process')

module.exports = function (originalStream, fallbackPaths) {
  try {
    return childProcess.execSync( `msgcat - ${fallbackPaths.join(' ')} --use-first`, {input : originalStream})
  } catch (e) {
    throw(e)
  }
}