import { clearStore, initBrowser, exists, isHidden, waitForAnimationEnd } from '../tools';

let browser;
let page;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
});

test('menu open favorite', async () => {
  await page.goto(APP_URL);
  await page.waitForSelector('.menu__button');

  await page.click('.menu__button');
  await page.waitForSelector('.menu__panel');
  await waitForAnimationEnd(page, '.menu__panel');
  await page.click('.menu-item:nth-child(1)');

  expect(await exists(page, '.favorite_panel')).toBeTruthy();
});

test('close service panel when opening direction', async () => {
  await page.goto(APP_URL);
  await page.click('.search_form__direction_shortcut');
  expect(await isHidden(page, '.service_panel')).toBeTruthy();
});

afterEach(async () => {
  await clearStore(page);
});

afterAll(async () => {
  await browser.close();
});
