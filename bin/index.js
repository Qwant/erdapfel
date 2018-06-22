const configBuilt = require('nconf-builder')
const App = require('./app')
const config = configBuilt.get()
const PORT = config.PORT

const appServer = new App(config)
appServer.start(PORT).then(() => {
  console.log(`Server listening on PORT : ${PORT}`)
})
