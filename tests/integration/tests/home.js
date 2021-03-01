import { initBrowser, exists } from '../tools';
let browser;
let page;

beforeAll(async () => {
  const browserPage = await initBrowser();
  browser = browserPage.browser;
});

beforeEach(async () => {
  page = await browser.newPage();
});

test('redirect unsupported browsers to dedicated page', async () => {
  // IE11 on Win10
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko');
  await page.goto(APP_URL);
  expect(page.url()).toEqual(`${APP_URL}/unsupported`);
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

afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await browser.close();
});
