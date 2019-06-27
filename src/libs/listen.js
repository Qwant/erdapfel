/**
 * Event communication wrapper
 */

(function Listen() {
  window.fire = function(name, params, ...additionalParams) {
    let event = document.createEvent('CustomEvent');
    event.initCustomEvent(name, false, false, {params, additionalParams});
    window.dispatchEvent(event);
  };
  window.listen = function(name, cb) {
    let presetEvent = eventHandler(cb);
    window.addEventListener(name, presetEvent);
    return {name, presetEvent};
  };
  window.unListen = function({name, presetEvent}) {
    window.removeEventListener(name, presetEvent);
  };
})();

function eventHandler(cb) {
  return opt => {
    let {detail} = opt;
    cb(detail.params, ...detail.additionalParams);
  };
}
