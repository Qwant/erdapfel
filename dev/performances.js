const puppeteer = require('puppeteer')
const fs = require('fs')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.config')


(async () => {
  const HOST_URI = 'http://10.100.31.92/tileview/'

  /* production build */
  const buildTime = buildProd()

  /* start host */
  const browser = await puppeteer.launch()
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

  await browser.close()
})()





function writeReport(reportData) {
  fs.writeFileSync('./report.json', JSON.stringify(reportData, null, '\t'))
}

function buildProd() {
  const prodConfig = webpackConfig('production', {mode : 'production'})
  webpack(prodConfig, function(error, chunkStats) {
    if(error) {
      console.error(error)
    }
    /* compute total build time (ms) */
    return chunkStats.stats.reduce((totalTime, chunkStat) => {
      return totalTime + (chunkStat.endTime - chunkStat.startTime)
    }, 0)
  })
}

