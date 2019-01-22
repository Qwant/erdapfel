const App = require( './../../bin/app')
const configBuilder = require('@qwant/nconf-builder')
const nock = require('nock')

let {...poiNoName} = require('../__data__/poi')
  /* default test with matching name & local_name */
  poiNoName.id = 'osm:way:453204'
  nock(/idunn_test\.test/)
    .persist(true)
    .get(/osm:way:453204/)
    .reply(200, JSON.stringify(poiNoName))

/* set mismatching local_name */
let {...poiFullName} = require('../__data__/poi')
  poiFullName.local_name = 'Orsay museum'
  poiFullName.id = 'osm:way:453203'
  nock(/idunn_test\.test/)
    .persist(true)
    .get(/osm:way:453203/)
    .reply(200, JSON.stringify(poiFullName))

nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:63178753.*/)
  .reply(200, JSON.stringify(require('../__data__/poi')))

nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:2403/)
  .reply(404)

nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:2403/)
  .reply(404, {status : 'not found'})

configBuilder.set('store:name', 'local_store')
configBuilder.set('mapStyle:baseMapUrl', "[]")
configBuilder.set('mapStyle:poiMapUrl', "[]")
configBuilder.set('services:idunn:url', 'http://idunn_test.test')
configBuilder.set('services:geocoder:url', `http://geocoder.test/autocomplete`)
configBuilder.set('system:evalFiles', false)
configBuilder.set('direction:enabled', true)

const config = configBuilder.get()
global.appServer = new App(config)

module.exports = async function() {
  console.log(`Start test on PORT : ${config.PORT}`)
  await global.appServer.start(config.PORT)
}
