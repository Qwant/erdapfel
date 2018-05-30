const App = require('./app')
const PORT = 3000
const appServer = new App()
appServer.start(PORT).then(() => {
  console.log(`Server listening on PORT : ${PORT}`)
})
