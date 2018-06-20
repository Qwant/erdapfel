import nconf from 'nconf-reader'
const config = nconf.get()

function StyleLaundry(style) {
  let rawStyle = JSON.stringify(style)
  return JSON.parse(rawStyle
    .replace(/\{locale\}/g, window.getLang().code)
    .replace('"{tileserver_base}"', JSON.stringify(config.tileserver_base))
    .replace('"{tileserver_poi}"', JSON.stringify(config.tileserver_poi))
    .replace('{spriteserver}', config.spriteserver)
    .replace('{fontserver}', config.fontserver))
}

export default StyleLaundry
