import nconf from '@qwant/nconf-getter'
import configure from 'mapbox_style_configure'
const qwantStyle = require('@qwant/qwant-basic-gl-style/style.json')

function toAbsoluteUrl(url) {
  if(!url.startsWith('http')){
    // Remove trailing / from baseUrl
    const cleanedBaseUrl = baseUrl.replace(/(\/+)$/g, '')
    return `${location.origin}${cleanedBaseUrl}${url}`
  }
  return url
}

function sceneConfig() {
  const mapStyleConfig = nconf.get().mapStyle
  mapStyleConfig.spritesUrl = toAbsoluteUrl(mapStyleConfig.spritesUrl)
  mapStyleConfig.fontsUrl = toAbsoluteUrl(mapStyleConfig.fontsUrl)
  return mapStyleConfig
}

export default function getStyle() {
  return configure(JSON.stringify(qwantStyle), sceneConfig(), window.getBaseLang().code)
}
