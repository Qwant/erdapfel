function Ajax() {}

Ajax.query = (url, data, cb, options = {method : 'GET'}) => {
  const resultPromise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = function(){
      try {
        var jsonResponse = JSON.parse(this.response)
      } catch (e) {
        reject(e)
        return
      }
      resolve(jsonResponse)
    }
    xhr.open(options.method,url+'?'+dataToUrl(data))
    xhr.send()
  })

  return resultPromise
}

function dataToUrl(data) {
  return Object.keys(data).map((itemKey) => {
    return `${itemKey}=${data[itemKey]}`
  }).join('&')
}

export default Ajax
