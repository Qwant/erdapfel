function get() {
  if(__config) {
    return __config
  } else {
    throw '__config is missing'
  }
}

export default {get : get}
