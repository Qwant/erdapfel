const globals = require('../../config/global.yml')

function Ajax() {}

Ajax.query = async (url, data, options = {method : 'GET'}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    let jsonResponse

    let timeOutHandler = setTimeout(() => {
      xhr.abort()
      reject('timeout')
    }, globals.timeout * 1000)

    xhr.onload = function(){
      try {
        jsonResponse = JSON.parse(this.response)
      } catch (e) {
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
    xhr.open(options.method,url+'?'+dataToUrl(data))
    xhr.send()
  })
}

const dataToUrl = (data) =>
  Object.keys(data)
    .map(itemKey => `${encodeURIComponent(itemKey)}=${encodeURIComponent(data[itemKey])}`)
    .join('&')

export default Ajax
