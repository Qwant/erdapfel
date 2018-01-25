const URI = {
  extractDomain : function (uri) {
    let hostname = ''
    if(uri.indexOf('://') === -1) { // keep at fist slash
      hostname = uri.split('/')[0]
    } else {
      hostname = uri.split('/')[2]
    }
    return hostname.split('?')[0]
  }
}

export default URI