const childProcess = require('child_process')
const path = require('path')
const utils = require('loader-utils')


module.exports = async function(source) {
  if(this.cacheable) {
    this.cacheable()
  }
  let callback = this.async()
  let options = utils.getOptions(this)

  options = options || {}

  const locale = options.locale
  const fallback = options.fallback
  const messagesPath = options.messagesPath

  if(fallback) {
    try {
      const fallbackList = fallback.reduce((fallbacks, fallback) => {
        fallbacks.push(path.join(messagesPath, `${fallback}.po`))
        return fallbacks
      }, [path.resolve(path.join(messagesPath, `${locale}.po`))])
      let mergedPo = await mergePo(source, fallbackList)
      callback(null, mergedPo)
    } catch (e) {
      callback(e)
    }
  } else {
    /* no fallback detected : return original po */
    callback(null, source)
  }
}

async function mergePo(source, fallbackList) {
  return new Promise((resolve, reject) => {
    childProcess.exec( `msgcat ${fallbackList.join(' ')}  --use-first`, {input : source}, (err, stdout) => {
      if(err) {
        reject(err)
      }
      resolve(stdout)
    })
  })
}

