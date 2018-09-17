const request = require('request')



module.exports = function(config) {



  const getLocale = function(req) {
    let acceptLanguages = req.headers['accept-language']
    this.config.language.supportedLanguages.find((supportedLanguage) => {

    })
  }



  const getTitle = function() {
    let isPoi = res.url.match('')
    return `Qwant map${isPoi ? '' : ''}`
  }

  async function getPoi(poiId) {
    return new Promise((resolve, reject) => {
      request(`${config.services.idunn.url}/${poiId}`, {json : true}, (error, response, body) => {
        if(error) {
          reject(error)
        } else {
          resolve(new Poi(response.name))
        }
      })
    })
  }


  const metas = [
    {property : 'title', content : getTitle},
    {property : 'site_name', content : 'Qwant map'},
    {property : 'description', content : 'Visualisez des multitudes de cartes, planifiez vos voyages, affichez des vues satellites, aériennes ou à l\'échelle de la rue. Faites-en toujours plus avec Bing Cartes.'},
    {property : 'image', content : '/images/maps_opengraph.png'},
    {property : 'url', content : 'www.qwant.com/maps'},
    {property : 'locale', content : getLocale},
  ]


  return function(req, res, next) {
    res.locals.metas = []
    let placeUrlMatch = req.originalUrl.match(/place\/(.*)/)[1]
    if(placeUrlMatch && placeUrlMatch.length > 0) {
      let poiId = placeUrlMatch[1]
      getPoi(poiId).then((poi) => {
        res.locals.poi = poi
        next()
      }).catch((error) => {
        next(error)
      })
    }
    next()
  }

}

