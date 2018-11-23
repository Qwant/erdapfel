export default function configure(style, mapStyleConfig, lang) {
  const rawStyle = JSON.stringify(style)

  const toAbsoluteUrl = (url) => {
    if(!url.startsWith('http')){
      /* Remove trailing / from baseUrl */
      const cleanedBaseUrl = baseUrl.replace(/(\/+)$/g, '')
      return `${location.origin}${cleanedBaseUrl}${url}`
    }
    return url
  }

  return JSON.parse(rawStyle
    .replace(/\{locale\}/g, lang)
    .replace('"{tileserver_base}"', mapStyleConfig.baseMapUrl)
    .replace('"{tileserver_poi}"', mapStyleConfig.poiMapUrl)
    .replace('{spriteserver}', toAbsoluteUrl(mapStyleConfig.spritesUrl))
    .replace('{fontserver}', toAbsoluteUrl(mapStyleConfig.fontsUrl))
  )
}
