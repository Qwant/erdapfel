function Ajax() {}

Ajax.query = (url, data, cb, options = {method : 'GET'}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    let jsonResponse
    xhr.onload = () => {
      try {
        jsonResponse = JSON.parse(this.response)
      } catch (e) {
        reject(e)
        return
      }
      resolve(jsonResponse)
    }
    xhr.open(options.method,url+'?'+dataToUrl(data))
    xhr.send()
  })
}

const dataToUrl = (data) =>
  Object.keys(data)
    .map(itemKey => `${itemKey}=${data[itemKey]}`)
    .join('&')

export default Ajax
