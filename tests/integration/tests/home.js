import { initBrowser, exists } from '../tools';
let browser;
let page;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
});

test('is dom loaded', async () => {
  await page.goto(APP_URL);
  expect(await exists(page, '#scene_container')).toBeTruthy();
});

test('is panels loaded', async () => {
  await page.goto(APP_URL);
  expect(await exists(page, '.service_panel')).toBeTruthy();
});

test('is map loaded', async () => {
  await page.goto(APP_URL);
  expect(await exists(page, '.mapboxgl-canvas')).toBeTruthy();
});

afterAll(async () => {
  await browser.close();
});
