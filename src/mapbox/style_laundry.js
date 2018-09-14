import nconf from '@qwant/nconf-getter'
const mapStyleConfig = nconf.get().mapStyle

function StyleLaundry(style) {
  const rawStyle = JSON.stringify(style)

  const toAbsoluteUrl = (url) => {
    if(!url.startsWith('http')){
      // Remove trailing / from baseUrl
      const cleanedBaseUrl = baseUrl.replace(/(\/+)$/g, '')
      return `${location.origin}${cleanedBaseUrl}${url}`
    }
    return url
  }

  return JSON.parse(rawStyle
    .replace(/\{locale\}/g, window.getBaseLang().code)
    .replace('"{tileserver_base}"', mapStyleConfig.baseMapUrl)
    .replace('"{tileserver_poi}"', mapStyleConfig.poiMapUrl)
    .replace('{spriteserver}', toAbsoluteUrl(mapStyleConfig.spritesUrl))
    .replace('{fontserver}', toAbsoluteUrl(mapStyleConfig.fontsUrl))
  )
}

export default StyleLaundry
