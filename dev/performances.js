const puppeteer = require('puppeteer')
const fs = require('fs')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.config')
const PORT = 3010
const HOST_URI = `http://localhost:${PORT}`


;(async () => {


  /* production build */
  const buildTime = -1//await buil&dProd()

  /* start host */
  const appServer = await serverStart()

  /* start puppeteer */
  const browser = await puppeteer.launch({headless:false})
  const page = await browser.newPage()

  /* connect to homepage for performance test */
  await page.goto(HOST_URI)

  const metrics = await page.metrics()
  const mapStats = fs.statSync('../public/build/javascript/map.js')
  const appStats = fs.statSync('../public/build/javascript/bundle.js')

  let reportData = {
    scriptDuration : metrics.ScriptDuration,
    buildTime : buildTime,
    size: {
      app : appStats.size,
      map: mapStats.size
    }
  }

  writeReport(reportData)
  serverClose(appServer)
 // await browser.close()
})()

function writeReport(reportData) {
  fs.writeFileSync('./report.json', JSON.stringify(reportData, null, '\t'))
}

async function buildProd() {
  const partialProdConfig = webpackConfig('production', {mode : 'production'})
  const prodConfig = partialProdConfig.map((prodConfigChunk) => {
    prodConfigChunk.mode = 'production'
    return prodConfigChunk
  })
  return new Promise((resolve) => {
    webpack(prodConfig, function(error, chunkStats) {
      if(error) {
        resolve(-1)
        console.error(error)
      }
      /* compute total build time (ms) */
      resolve(chunkStats.stats.reduce((totalTime, chunkStat) => {
        return totalTime + (chunkStat.endTime - chunkStat.startTime)
      }, 0))
    })
  })
}

async function serverStart() {
  const App = require( './../bin/app')
  const configBuilder = require('@qwant/nconf-builder')

  configBuilder.set('store:name', 'local_store')
  configBuilder.set('mapStyle:baseMapUrl', "[]")
  configBuilder.set('mapStyle:poiMapUrl', "[]")
  configBuilder.set('services:idunn:url', 'http://idunn_test.test')
  configBuilder.set('services:geocoder:url', `http://geocoder.test/autocomplete`)
  configBuilder.set('system:evalFiles', false)

  const config = configBuilder.get()
  const appServer = new App(config)

  console.log(`Start test on PORT : ${PORT}`)
  await appServer.start(PORT)
  return appServer
}

function serverClose(appServer) {
  appServer.close()
}

