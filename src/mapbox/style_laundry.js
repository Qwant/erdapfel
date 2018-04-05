function StyleLaundry(style) {
  return JSON.parse(JSON.stringify(style).replace(/\{locale\}/g, window.getLang().code))
}

export default StyleLaundry
