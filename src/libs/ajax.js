import nconf from '@qwant/nconf-getter'
const systemConfigs = nconf.get().system
const timeout = systemConfigs.timeout
function Ajax() {}

Ajax.get = (url, data, options) => {
  return query(url, data, 'GET', options)
}

Ajax.post = (url, data, options) => {
  return query(url, data, 'POST', options)
}

Ajax.getLang = async (url, data = {}, options) => {
  data.lang = getLang().code
  return Ajax.get(url, data, options)
}

/* private */
const query = (url, data, method = 'GET') => {
  const xhr = new XMLHttpRequest()

  let ajaxPromise = new Promise((resolve, reject) => {
    let jsonResponse
    let xhrStatus = -1
    let timeOutHandler = setTimeout(() => {
      xhr.abort()
      reject(`Timeout calling ${url}`)
    }, timeout * 1000)

    xhr.onload = function () {
      if(xhrStatus !== 204) {
        try {
          jsonResponse = JSON.parse(this.response)
        } catch (e) {
          console.error('json', this.response)
          clearTimeout(timeOutHandler)
          reject(e)
          return
        }
        resolve(jsonResponse)
      } else {
        resolve()
      }
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && (xhr.status < 200 || xhr.status >= 300)) {
        clearTimeout(timeOutHandler)
        reject(xhr.status)
      } else {
        xhrStatus = xhr.status
      }
    }
    if(method === 'GET') {
      xhr.open(method, `${url}?${dataToUrl(data)}`)
      xhr.send()
    } else {
      xhr.open(method, url)
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      xhr.send(JSON.stringify(data))
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
