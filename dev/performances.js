const puppeteer = require('puppeteer')
const fs = require('fs')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.config')
const PORT = 3010
const HOST_URI = `http://localhost:${PORT}`


;(async () => {


  /* production build */
  const buildTime = await buildProd()

  /* start host */
  const appServer = await serverStart()

  /* start puppeteer */
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  /* connect to homepage for performance test */
  await page.goto(HOST_URI)

  const metrics = await page.metrics()
  const mapStats = fs.statSync('../public/build/javascript/map.js')
  const appStats = fs.statSync('../public/build/javascript/bundle.js')

  let times = await page.evaluate(() => {
    return window.times
  })



  let reportData = {
    times : {
      script : metrics.ScriptDuration,
      build : buildTime,
      appRender : times.appRendered - times.init,
      load : times.mapLoaded - times.init
    },
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

  configBuilder.set('mapStyle:poiMapUrl', `["http://localhost:${PORT}/fake_pbf/{z}/{x}/{y}.pbf"]`)
  configBuilder.set('mapStyle:baseMapUrl', `["http://localhost:${PORT}/fake_pbf/{z}/{x}/{y}.pbf"]`)
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

