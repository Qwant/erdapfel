function Ajax() {}

Ajax.query = async (url, data, options = {method : 'GET'}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    let jsonResponse
    xhr.onload = function(){
      try {
        jsonResponse = JSON.parse(this.response)
      } catch (e) {
        reject(e)
        return
      }
      resolve(jsonResponse)
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 0) {
        reject(xhr)
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
