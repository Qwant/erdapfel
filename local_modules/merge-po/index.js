const configBuilt = require('nconf-builder')
const childProcess = require('child_process')
const path = require('path')

const srcPath = path.resolve(path.join(__dirname, '..', '..', 'language', 'message'))
configBuilt.get().languages.forEach((language) => {
  const fallbackList = language.fallbacks.map((fallback) => {
    return srcPath + fallback
  })
  merge(srcPath)
})

function merge(fallbackList, dest) {
  childProcess.exec( `msgcat ${fallbacks.join()} -o ${dest} --use-first`, (error, out) => {
    if(error) {
      console.error(error)
    } else {
      console.log(out)
    }
  })
}
