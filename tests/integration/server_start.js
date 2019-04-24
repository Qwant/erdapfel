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

const config = configBuilder.get()

// Specific config values for tests
config.mapStyle.baseMapUrl = "[]"
config.mapStyle.poiMapUrl = "[]"
config.services.idunn.url = 'http://idunn_test.test'
config.services.geocoder.url = 'http://geocoder.test/autocomplete'
config.system.evalFiles = false
config.direction.enabled = true

global.appServer = new App(config)

module.exports = async function() {
  console.log(`Start test on PORT : ${config.PORT}`)
  await global.appServer.start(config.PORT)
}
