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

test('Use FR language setting from Qwant Search cookie', async () => {
  await page.goto(APP_URL);
  await page.setCookie({ name: 'l', value: 'fr' });
  await page.reload();
  const preferedLanguage = await page.evaluate('window.preferedLanguage');
  expect(preferedLanguage.code).toEqual('fr');
});

test('Use default language setting when Qwant Search cookie is not supported', async () => {
  await page.goto(APP_URL);
  await page.setCookie({ name: 'l', value: 'ko' });
  await page.reload();
  const preferedLanguage = await page.evaluate('window.preferedLanguage');
  expect(preferedLanguage.code).toEqual('en');
});

test('Use default language when no Qwant Search cookie is set', async () => {
  await page.goto(APP_URL);
  await page.deleteCookie({ name: 'l' });
  await page.reload();
  const preferedLanguage = await page.evaluate('window.preferedLanguage');
  expect(preferedLanguage.code).toEqual('en');
});

afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await browser.close();
});
