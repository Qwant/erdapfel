const request = require('request')
const acceptLanguage = require('accept-language')
const QueryError = require('../query_error')

const metas = [
  {name : 'site_name', content : 'Qwant map'},
  {name : 'image', content : '/images/maps_opengraph.png'},
  {name : 'url', content : 'www.qwant.com/maps'},
]

module.exports = function(config, constants) {
  async function getPoi(poiId, locale) {
    let id = poiId
    let atPos = poiId.indexOf('@')
    if(atPos !== -1) {
      id = poiId.slice(0, atPos)
    }

    return new Promise((resolve, reject) => {
      request(`${config.services.idunn.url}/v1/pois/${id}?lang=${locale.code}`, {json : true}, (error, response, body) => {
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
    res.locals.metas = metas.map(meta => meta)
    res.locals.metas.push({name : 'locale', content : locale.locale})
    res.locals.metas.push({name : 'description', content : res.locals. _('Map multiple locations. Do more with Qwant Maps.')})
  }

  function poiMeta(poi, locale, req, res, next) {
    commonMeta(locale, req, res)
    res.locals.poi = poi
    res.locals.metas.push({name : 'title', content : `${res.locals. _('Qwant map')} | ${poi.name}`})
    next()
  }
  function homeMeta(locale, req, res, next) {
    commonMeta(locale, req, res)
    res.locals.metas.push({name : 'title', content : `${res.locals. _('Qwant map')}`})
    next()
  }

  function getLocale(req) {
    let rawAcceptLanguages = req.headers['accept-language']
    let supportedLanguages = constants.languages.supportedLanguages

    acceptLanguage.languages(supportedLanguages.map(supportedLanguage =>
      supportedLanguage.locale.replace('_', '-')
    ))

    let rawLocaleCode = acceptLanguage.get(rawAcceptLanguages)
    let localeCode = rawLocaleCode.replace('-', '_')

    let locale = constants.languages.defaultLanguage

    supportedLanguages.forEach((languageConfig) => {
      if(languageConfig.locale === localeCode) {
        locale = languageConfig
      }
    })
    return locale
  }

  return function(req, res, next) {
    let placeUrlMatch = req.originalUrl.match(/place\/(.*)/)
    let locale = getLocale(req)
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
