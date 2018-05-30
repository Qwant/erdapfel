const App = require( './../../bin/app')

let appServer = new App()
const NodeEnvironment = require('jest-environment-node');

class remoteEnvironment extends NodeEnvironment {
  constructor(config) {
    if(global.port) {
      global.port = global.port+1
    } else {
      global.port = 3000
    }
    super(config)
    console.log(`Start test on PORT : ${global.port}`)
    this.serverPromise = appServer.start(global.port)
  }

  async setup() {
    await this.serverPromise
  }

  async teardown() {}

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = remoteEnvironment