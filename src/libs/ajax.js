function Ajax() {}

Ajax.query = (url, data, cb, options = {method : 'GET'}) => {
  const xhr = new XMLHttpRequest()
  xhr.onload = function(){
    try {
      var jsonResponse = JSON.parse(this.response)
    } catch (e) {
      cb(e)
      return
    }
    cb(null, jsonResponse)
  }
  xhr.open(options.method,url+'?'+dataToUrl(data))
  xhr.send()
}


function dataToUrl(data) {
  return Object.keys(data).map((itemKey) => {
    return `${itemKey}=${data[itemKey]}`
  }).join('&')
}

export default Ajax