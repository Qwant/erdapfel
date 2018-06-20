import nconf from 'nconf-getter'
const mapStyleConfig = nconf.get().mapStyle

function StyleLaundry(style) {
  let rawStyle = JSON.stringify(style)
  return JSON.parse(rawStyle
    .replace(/\{locale\}/g, window.getLang().code)
    .replace('"{tileserver_base}"', JSON.stringify(mapStyleConfig.tileserver_base))
    .replace('"{tileserver_poi}"', JSON.stringify(mapStyleConfig.tileserver_poi))
    .replace('{spriteserver}', mapStyleConfig.spriteserver)
    .replace('{fontserver}', mapStyleConfig.fontserver))
}

export default StyleLaundry
