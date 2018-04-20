const fs = require('fs')

module.exports = function(source, sources) {
  let i18nPromises = sources.map((i18nSource) => {
    return new Promise((resolve, reject) => {
      fs.readFile(i18nSource.path, (error, buffer) => {
        if (error) {
          console.error(`Error during merge i18n mixed source ${error}`)
          reject(error)
        } else {
          let bufferPrefix = Buffer.from(`${i18nSource.name} = `, 'utf8')
          let bufferPostfix = Buffer.from(`;\n`, 'utf8')
          resolve(Buffer.concat([bufferPrefix, buffer, bufferPostfix]))
        }
      })
    })
  })
  return new Promise((resolve, reject) => {
    Promise.all(i18nPromises).then((i18nComplementBuffers) => {
      try {
        let bufferSource = Buffer.from(source, 'utf8')
        resolve(Buffer.concat(i18nComplementBuffers.concat(bufferSource)))
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })
  })
}
