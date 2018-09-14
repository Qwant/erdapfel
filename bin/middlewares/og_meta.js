const metas = [
  {property : 'title', content : ''},
  {property : 'site_name', content : ''},
  {property : 'description', content : ''},
  {property : 'image', content : ''},
  {property : 'url', content : ''},
  {property : 'locale', content : ''},
]

module.exports = function(req, res, next){


  res.locals.meta = printMetas

  next()
}

function printMetas() {
  metas.map((meta) => {
    return domMeta(meta)
  })
}



function domMeta(meta) {
  return `<meta property="${meta.property}" content="${meta.content}"\>`
}
