/* globals require, __dirname */
/* eslint no-console: off, max-len: off */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const childProcess = require('child_process');
const webpackConfig = require('../build/webpack.config');
const PORT = 3010;
const HOST_URI = `http://localhost:${PORT}`


;(async () => {
  /* production build */
  const buildTime = await buildProd();

  /* start host */
  const appServer = await serverStart();

  /* start puppeteer */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  /* connect to homepage for performance test */
  await page.goto(HOST_URI);

  const metrics = await page.metrics();
  const mapStats = fs.statSync(path.join(__dirname, '../public/build/javascript/map.js'));
  const appStats = fs.statSync(path.join(__dirname, '../public/build/javascript/bundle.js'));
  await wait(3000);
  const times = await page.evaluate(() => {
    return window.times;
  });

  const reportData = {
    date: new Date(),
    git: await getCommit(),
    times: {
      script: metrics.ScriptDuration,
      build: buildTime,
      appRender: times.appRendered - times.init,
      mapLoad: times.mapLoaded - times.init,
    },
    size: {
      app: appStats.size,
      map: mapStats.size,
    },
  };

  printReport(reportData);
  writeReport(reportData);

  serverClose(appServer);
  await browser.close();
})();

function writeReport(reportData) {
  let reportFile = null;
  try {
    reportFile = require(path.join(__dirname, '/report.json'));
    reportFile.reports.push(reportData);
  } catch (e) {
    console.error('Error while getting reports, ensure report.json is already created');
    return;
  }
  fs.writeFileSync(path.join(__dirname, '/report.json'), JSON.stringify(reportFile, null, '\t'));
}

function printReport(report) {
  console.log(`\n\nApp bundle size: ${(report.size.app / 1024).toFixed(1)}ko\tMap bundle size: ${(report.size.map / 1024).toFixed(1)}ko`);
  console.log(`Script duration: ${(report.times.script * 1000).toFixed(1)}ms\tBuild duration: ${(report.times.build / 1000).toFixed(1)}s`);
  console.log(`App load duration: ${report.times.appRender}ms\tMap load duration: ${report.times.mapLoad}ms\n\n`);
}

async function buildProd() {
  const partialProdConfig = webpackConfig('production', { mode: 'production' });
  const prodConfig = partialProdConfig.map(prodConfigChunk => {
    prodConfigChunk.mode = 'production';
    return prodConfigChunk;
  });
  return new Promise(resolve => {
    webpack(prodConfig, function(error, chunkStats) {
      if (error) {
        resolve(-1);
        console.error(error);
      }
      /* compute total build time (ms) */
      resolve(chunkStats.stats.reduce((totalTime, chunkStat) => {
        return totalTime + (chunkStat.endTime - chunkStat.startTime);
      }, 0));
    });
  });
}

async function wait(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

async function serverStart() {
  const App = require(path.join(__dirname, '../bin/app'));
  const configBuilder = require('@qwant/nconf-builder');

  configBuilder.set('store:name', 'local_store');

  configBuilder.set('mapStyle:poiMapUrl', `["http://localhost:${PORT}/fake_pbf/{z}/{x}/{y}.pbf"]`);
  configBuilder.set('mapStyle:baseMapUrl', `["http://localhost:${PORT}/fake_pbf/{z}/{x}/{y}.pbf"]`);
  configBuilder.set('performance:enabled', true);


  const config = configBuilder.get();
  const appServer = new App(config);

  console.log(`Start test on PORT : ${PORT}`);
  await appServer.start(PORT);
  return appServer;
}

async function getCommit() {
  return new Promise(resolve => {
    childProcess.exec('git rev-parse HEAD', function(err, stdout) {
      resolve(stdout.trim());
    });
  });
}

function serverClose(appServer) {
  appServer.close();
}
