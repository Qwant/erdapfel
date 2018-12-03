module.exports = class URI {
  static extractDomain (uri) {
    let hostname = ''
    if(uri.indexOf('://') === -1) { // keep at fist slash
      hostname = uri.split('/')[0]
    } else {
      hostname = uri.split('/')[2]
    }
    return hostname.split('?')[0]
  }

  static externalise (uri) {
    if(uri.indexOf('http://') === 0 || uri.indexOf('https://') === 0) {
      return uri
    } else {
      return `http://${uri}`
    }
  }

  static toAbsoluteUrl(origin, baseUrl, url) {
    if(!url.startsWith('http')){
      // Remove trailing / from baseUrl
      const cleanedBaseUrl = baseUrl.replace(/(\/+)$/g, '')
      return `${origin}${cleanedBaseUrl}${url}`
    }
    return url
  }
}
