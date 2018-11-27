module.exports = function configure(style, mapStyleConfig, lang) {
  return JSON.parse(style
    .replace(/\{locale\}/g, lang)
    .replace('"{tileserver_base}"', mapStyleConfig.baseMapUrl)
    .replace('"{tileserver_poi}"', mapStyleConfig.poiMapUrl)
    .replace('{spriteserver}', mapStyleConfig.spritesUrl)
    .replace('{fontserver}', mapStyleConfig.fontsUrl)
  )
}
