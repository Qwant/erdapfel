const App = require( './../../bin/app')
const config = require('./config')
global.appServer = new App()

module.exports = async function () {
  console.log(`Start test on PORT : ${config.SERVER.PORT}`)
  await global.appServer.start(config.SERVER.PORT)
}
