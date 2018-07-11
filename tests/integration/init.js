const App = require( './../../bin/app')

const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
global.appServer = new App(config)

configBuilder.set('store:name', 'local_store')
configBuilder.set('mapStyle:baseMapUrl', "[]")
configBuilder.set('mapStyle:poiMapUrl', "[]")
configBuilder.set('services:geocoder:url', `http://localhost:${config.PORT}/autocomplete`)
configBuilder.set('services:poi:url', `http://localhost:${config.PORT}/poi`)

global.puppeteerArguments = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']

module.exports = async function() {
  console.log(`Start test on PORT : ${config.PORT}`)
  await global.appServer.start(config.PORT)
}