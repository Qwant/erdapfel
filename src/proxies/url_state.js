function UrlState() {}

UrlState.init = function () {
  window.__components = []
  window.location.hash
}
UrlState.register = function(component) {
  if(!component.store || !component.restore) {
    throw 'this componentn doesn\'t implement required methods'
  }
  __components.push(component)
}

UrlState.updateUrl = function() {
  window.location.hash = '/' + __components.map((component) => {
    return component.store()
  }).join('/')
}

UrlState.load = function() {
  __components.forEach((component) => {
    component.restore(window.location.hash)
  })
}

export default UrlState
