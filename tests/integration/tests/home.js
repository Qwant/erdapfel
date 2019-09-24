import { initBrowser } from '../tools';
import ResponseHandler from '../helpers/response_handler';
const { Options, runTests } = require('browser-ui-test');
const configBuilder = require('@qwant/nconf-builder');
const config = configBuilder.get();
const APP_URL = `http://localhost:${config.PORT}`;
const mockAutocomplete = require('../../__data__/autocomplete.json');
let browser;
let page;
let responseHandler;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
  responseHandler = await ResponseHandler.init(page);
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete/);
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
  expect.assertions(1);
  const options = new Options();
  options.onPageCreatedCallback = async page => {
    await page.setExtraHTTPHeaders({
      'accept-language': 'fr_FR,fr,en;q=0.8', /* force fr header */
    });
    await page.setRequestInterception(true);

    page.on('console', msg => {
      /* eslint-disable no-console */
      console.log(`> ${msg.text()}`);
    });
    page.on('request', async interceptedRequest => {
      console.log('==> ' + interceptedRequest.url());
      const preparedResponse = responseHandler.preparedResponses.find(preparedResponse => {
        return interceptedRequest.url().match(preparedResponse.query);
      });

      if (preparedResponse) {
        interceptedRequest.headers['Access-Control-Allow-Origin'] = '*';
        interceptedRequest.headers['Access-Control-Allow-Headers'] = '*';
        let status = 200;
        if (preparedResponse.options) {
          if (preparedResponse.options.status) {
            status = preparedResponse.options.status;
          }
        }
        await interceptedRequest.respond({
          status,
          body: JSON.stringify(preparedResponse.response),
          headers: interceptedRequest.headers }
        );
        return;
      }
      interceptedRequest.continue();
    });
  };
  try {
    options.parseArguments(
      ['--test-folder', __dirname, '--failure-folder', __dirname,
        '--no-screenshot', '--variable', 'URL', APP_URL,
        '--timeout', '20000']);
  } catch (error) {
    console.error(`invalid argument: ${error}`);
    expect(false).not.toBeFalsy();
  }
  const [output, nb_failures] = await runTests(options);
  console.log(output);
  expect(nb_failures === 0).not.toBeFalsy();
}, 30000);
