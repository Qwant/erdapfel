const request = require('request')
const QueryError = require('../query_error')

const ogMetas = [
  {name : 'site_name', content : 'Qwant Maps'},
  {name : 'image', content : '/images/maps_opengraph.png'},
  {name : 'url', content : 'www.qwant.com/maps'}
]

module.exports = function(config) {
  async function getPoi(poiId, locale) {
    let id = poiId
    let atPos = poiId.indexOf('@')
    if(atPos !== -1) {
      id = poiId.slice(0, atPos)
    }

    return new Promise((resolve, reject) => {
      let idunnUrl =`${config.services.idunn.url}/v1/pois/${id}?lang=${locale.code}`
      request(idunnUrl, {json : true}, (error, response, body) => {
        if(error) {
          reject(error)
        } else if(response.statusCode === 404) {
          resolve(null)
        } else {
          resolve(body)
        }
      })
    })
  }

  function commonMeta(locale, req, res) {
    res.locals.ogMetas = ogMetas.map(meta => meta)
    res.locals.ogMetas.push({name : 'locale', content : locale.locale})
    res.locals.ogMetas.push({name : 'description', content : res.locals. _('Map multiple locations. Do more with Qwant Maps.')})
  }

  function poiMeta(poi, locale, req, res, next) {
    commonMeta(locale, req, res)
    res.locals.poi = poi
    res.locals.ogMetas.push({name : 'title', content : poi.name})
    next()
  }

  function homeMeta(locale, req, res, next) {
    commonMeta(locale, req, res)
    res.locals.ogMetas.push({name : 'title', content : 'Qwant Maps'})
    next()
  }

  return function(req, res, next) {
    let placeUrlMatch = req.originalUrl.match(/place\/(.*)/)
    let locale = res.locals.language
    if(placeUrlMatch && placeUrlMatch.length > 0) {
      let poiId = placeUrlMatch[1]
      getPoi(poiId, locale).then((poi) => {
        if(poi) {
          poiMeta(poi, locale, req, res, next)
        } else {
          res.redirect(307, '/')
        }
      }).catch((error) => {
        new QueryError(error)
        homeMeta(locale, req, res, next)
      })
    } else {
      homeMeta(locale, req, res, next)
    }
  }
}
