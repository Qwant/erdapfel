const puppeteer = require('puppeteer')
const fs = require('fs')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.config')

const getScriptDuration = async () => {

  /* production build */
  buildProd()

  /* start host */
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  /* connect to homepage for performance test */
  await page.goto('http://10.100.31.92/tileview/')

  const metrics = await page.metrics()
  const mapStats = fs.statSync('../public/build/javascript/map.js')
  const appStats = fs.statSync('../public/build/javascript/bundle.js')


  console.log(mapStats)
  console.log(appStats)


  let reportData = {
    scriptDuration : metrics.ScriptDuration,
    size: {
      app : appStats.size,
      map: mapStats.size
    }
  }

  writeReport(reportData)






    await browser.close()
}

getScriptDuration()



function writeReport(reportData) {
  fs.writeFileSync('./report.json', JSON.stringify(reportData, null, '\t'))
}

function buildProd() {

  webpack(webpackConfig, function(error, stats) {
    if(error)
      console.error(error)
    console.log(stats)
  });
}

