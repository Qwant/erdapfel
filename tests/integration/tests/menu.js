import { clearStore, initBrowser, exists, isHidden, waitForAnimationEnd } from '../tools';

let browser;
let page;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
});

test('test menu toggling', async () => {
  await page.goto(APP_URL);
  await page.waitForSelector('.menu__button');
  expect(await isHidden(page, '.menu__panel')).toBeTruthy();

  await page.click('.menu__button');
  expect(await exists(page, '.menu__panel')).toBeTruthy();

  await waitForAnimationEnd(page, '.menu__panel');
  await page.click('.menu__panel__top__close');
  expect(await isHidden(page, '.menu_panel')).toBeTruthy();
});

afterEach(async () => {
  await clearStore(page);
});

afterAll(async () => {
  await browser.close();
});
