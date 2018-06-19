const config = require('./midleware/conf_reader')
const App = require('./app')
const PORT = config.get('PORT')

const appServer = new App(config)
appServer.start(PORT).then(() => {
  console.log(`Server listening on PORT : ${PORT}`)
})
