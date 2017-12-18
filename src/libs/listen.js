/**
 * Event communication wrapper
 */

(function Listen() {
  window.fire = function(name, params) {
    let event = new CustomEvent(name, {detail : params})
    window.dispatchEvent(event)
  }
  window.listen = function(name, cb) {
    window.addEventListener(name, ({detail}) => {
      cb(detail)
    })
  }
})()