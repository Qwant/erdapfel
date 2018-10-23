/**
 * Event communication wrapper
 */

(function Listen() {
  window.fire = function(name, params, ...additionalParams) {
    let event = document.createEvent('CustomEvent')//new CustomEvent(name, {detail : {params, additionalParams}})
    event.initCustomEvent(name, false, false, {params, additionalParams})
    window.dispatchEvent(event)
  }
  window.listen = function(name, cb) {
    window.addEventListener(name, ({detail}) => {
      cb(detail.params, ...detail.additionalParams)
    })
  }
})()
