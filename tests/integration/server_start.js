const App = require( './../../bin/app')
const configBuilder = require('@qwant/nconf-builder')
const nock = require('nock')

nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:63178753/)
  .reply(200, JSON.stringify(require('../__data__/poi')))

nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:2403/)
  .reply(404)


configBuilder.set('store:name', 'local_store')
configBuilder.set('mapStyle:baseMapUrl', "[]")
configBuilder.set('mapStyle:poiMapUrl', "[]")
configBuilder.set('services:idunn:url', 'http://idunn_test.test')
configBuilder.set('services:geocoder:url', `http://geocoder.test/autocomplete`)
configBuilder.set('system:evalFiles', false)

const config = configBuilder.get()
global.appServer = new App(config)

module.exports = async function() {
  console.log(`Start test on PORT : ${config.PORT}`)
  await global.appServer.start(config.PORT)
}
