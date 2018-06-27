const childProcess = require('child_process')

module.exports = function (originalStream, fallbackPaths) {
  return new Promise((resolve, reject) => {
    childProcess.exec( `msgcat ${fallbackPaths.join(' ')}  --use-first`, {input : originalStream}, (err, stdout) => {
      if(err) {
        reject(err)
        return
      }
      resolve(stdout)
    })
  })
}