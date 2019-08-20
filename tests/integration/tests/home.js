import { initBrowser } from '../tools';
const {Options, runTests} = require('browser-ui-test');
const configBuilder = require('@qwant/nconf-builder');
const config = configBuilder.get();
const APP_URL = `http://localhost:${config.PORT}`;
let browser;
let page;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
});

test('is dom loaded', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  const sceneContent = await page.waitForSelector('#scene_container');
  expect(sceneContent).not.toBeFalsy();
});

test('is panels loaded', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  const sceneContent = await page.waitForSelector('.service_panel');
  expect(sceneContent).not.toBeFalsy();
});

test('is map loaded', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  const sceneContent = await page.waitForSelector('.mapboxgl-canvas');
  expect(sceneContent).not.toBeFalsy();
});

afterAll(async () => {
  await browser.close();
});

test('goml', async () => {
  const options = new Options();
  try {
      options.parseArguments(['--test-folder', __dirname, '--failure-folder', __dirname,
                              '--no-screenshot', '--variable', 'URL', APP_URL]);
  } catch (error) {
      console.error(`invalid argument: ${error}`);
      expect(false);
  }
  runTests(options).then(x => {
    const [output, nb_failures] = x;
    console.log(output);
    expect(nb_failures === 0);
  }).catch(err => {
    console.error(err);
    expect(false);
  });
});
