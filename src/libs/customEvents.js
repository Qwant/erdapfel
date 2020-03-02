
function fire(name, params, ...additionalParams) {
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(name, false, false, { params, additionalParams });
  document.dispatchEvent(event);
}

function listen(name, cb) {
  const presetEvent = eventHandler(cb);
  document.addEventListener(name, presetEvent);
  return { name, presetEvent };
}

function unListen({ name, presetEvent }) {
  document.removeEventListener(name, presetEvent);
}

function eventHandler(cb) {
  return opt => {
    const { detail } = opt;
    cb(detail.params, ...detail.additionalParams);
  };
}

export { fire, listen, unListen };
