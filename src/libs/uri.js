const URI = {
  extractDomain : function (uri) {
    let hostname = ''
    if(uri.indexOf('://') === -1) { // keep at fist slash
      hostname = uri.split('/')[0]
    } else {
      hostname = uri.split('/')[2]
    }
    return hostname.split('?')[0]
  },
  externalise : function(uri) {
    if(uri.indexOf('http://') === 0 || uri.indexOf('https://') === 0) {
      return uri
    } else {
      return `http://${uri}`
    }
  }
}

Window.UriState = () => {
  this.position = {}
  this.zoom = 0
  this.poi = null

}

window.UrlState = {
  states : [],
  getState : () => {

  },
  pushState : (state) => {

  }
}

export default URI