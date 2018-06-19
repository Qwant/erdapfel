function get() {
  if(window.__config) {
    return window.__config
  } else {
    throw '__config is missing'
  }
}

export default {get : get}
