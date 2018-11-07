export default function get() {
  if(__config) {
    return __config
  } else {
    throw '__config is missing'
  }
}
