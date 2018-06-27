const childProcess = require('child_process')
const path = require('path')
const utils = require('loader-utils')


module.exports = async function(source) {
  let callback = this.async()
  let options = utils.getOptions(this)
  options = options || {}

  const locale = options.locale
  const fallback = options.fallback

  const messagesPath = path.join(__dirname, '..', '..', 'language', 'message')
  if(fallback) {
    const fallbackList = fallback.reduce((fallbacks, fallback) => {
      fallbacks.push(path.resolve(path.join(messagesPath, `${fallback}.po`)))
      return fallbacks
    }, [path.resolve(path.join(messagesPath, `${locale}.po`))])
    let mergedPo = await mergePo(source, fallbackList)
    callback(mergedPo)
  } else {
    /* no fallback detected : return original po */
    callback(source)
  }
}

async function mergePo(source, fallbackList) {
  return new Promise((resolve) => {
    childProcess.exec( `msgcat ${fallbackList.join(' ')}  --use-first`, {input : source}, (err, stdout) => {
      if(err) {
        console.error(err)
      }
      resolve(stdout)
    })
  })
}

