function UrlState() {}

UrlState.init = function () {
  if(!window.__url_state) {
    window.__url_state = {components : []}
  }
}

UrlState.register = function(component) {
  if(!component.store || !component.restore) {
    throw 'this componentn doesn\'t implement required methods'
  }
  __url_state.components.push({component, consumable : true})
}

UrlState.updateUrl = function() {
  let url = __url_state.components.map(
    componentWrap => componentWrap.component.store()
  ).filter(
    urlFragment => urlFragment !== ''
  ).join('/')

  if(history && typeof history.replaceState !== 'undefined') {
    history.replaceState(null, null, `#${url}`)
  } else {
    location.hash = url
  }
}

UrlState.load = function() {
  __url_state.components.forEach((componentWrap) => {
    if(componentWrap.consumable) {
      componentWrap.consumable = false
      componentWrap.component.restore(window.location.hash)
    }
  })
}

export default UrlState
