const App = require( './../../bin/app')
const configBuilder = require('nconf-builder')
const config = configBuilder.get()
const PORT = 3001
global.appServer = new App(config)

configBuilder.set('store:name', 'local_store')
configBuilder.set('mapStyle:baseMapUrl', "[]")
configBuilder.set('mapStyle:poiMapUrl', "[]")
configBuilder.set('services:geocoder:url', `http://localhost:${PORT}/autocomplete`)

module.exports = async function () {
  console.log(`Start test on PORT : ${PORT}`)
  await global.appServer.start(PORT)
}
