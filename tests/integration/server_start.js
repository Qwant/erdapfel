const App = require( './../../bin/app')
const config = require('nconf-builder')
const PORT = 3001
global.appServer = new App(config)

config.set('store:name', 'local_store')

module.exports = async function () {
  console.log(`Start test on PORT : ${PORT}`)
  await global.appServer.start(PORT)
}
