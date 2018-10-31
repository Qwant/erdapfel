import nconf from '@qwant/nconf-getter'
const systemConfigs = nconf.get().system
const timeout = systemConfigs.timeout
function Ajax() {}

Ajax.queryLang = async (url, data = {}, options) => {
  data.lang = getLang().code
  return Ajax.query(url, data, options)
}

Ajax.query = (url, data, options = {method : 'GET'}) => {
  const xhr = new XMLHttpRequest()

  let ajaxPromise = new Promise((resolve, reject) => {
    let jsonResponse

    let timeOutHandler = setTimeout(() => {
      xhr.abort()
      reject(`Timeout calling ${url}`)
    }, timeout * 1000)

    xhr.onload = function () {
      try {
        jsonResponse = JSON.parse(this.response)
      } catch (e) {
        console.error('json', this.response)
        clearTimeout(timeOutHandler)
        reject(e)
        return
      }
      resolve(jsonResponse)
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status !== 200) {
        clearTimeout(timeOutHandler)
        reject(xhr.status)
      }
    }
    if(options.method === 'GET') {
      xhr.open(options.method, url + '?' + dataToUrl(data))
      xhr.send()
    } else {
      xhr.open(options.method, url)
      xhr.send(dataToUrl(data))
    }

  })
  ajaxPromise.abort = () => {
    xhr.abort()
  }

  return ajaxPromise
}

const dataToUrl = (data) =>
  Object.keys(data)
    .map(itemKey => `${encodeURIComponent(itemKey)}=${encodeURIComponent(data[itemKey])}`)
    .join('&')

export default Ajax
