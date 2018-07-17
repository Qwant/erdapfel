/**
 * Event communication wrapper
 */

(function Listen() {
  window.fire = function(name, params, ...additionalParams) {
    let event = new CustomEvent(name, {detail : {params, additionalParams}})
    window.dispatchEvent(event)
  }
  window.listen = function(name, cb) {
    window.addEventListener(name, ({detail}) => {
      cb(detail.params, ...detail.additionalParams)
    })
  }
})()