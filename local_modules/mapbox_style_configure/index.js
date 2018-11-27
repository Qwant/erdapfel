module.exports = function configure(style, mapStyleConfig, styleUrl, lang) {
  const rawStyle = JSON.stringify(style)

  const toAbsoluteUrl = (url) => {
    if(!url.startsWith('http')){
      /* Remove trailing / from baseUrl */
      const cleanedBaseUrl = styleUrl.replace(/(\/+)$/g, '')
      return `${cleanedBaseUrl}${url}`
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
