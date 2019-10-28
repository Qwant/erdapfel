import { initBrowser } from '../tools';
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
