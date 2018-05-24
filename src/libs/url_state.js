function UrlState() {}
UrlState.data = {}

UrlState.set = function(label, value) {
  UrlState.data[label] = value
  updateUrl()
}

UrlState.get = function(label) {
  UrlState.data[label]
}

UrlState.init = function() {
  window.location.hash
}


function updateUrl() {
  window.location.hash = Object.keys(UrlState.data).map((key) => {
    return `${key[0]}${UrlState.data[key]}`
  }).join('/')
}



export default UrlState
