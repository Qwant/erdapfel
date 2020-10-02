import { clearStore, initBrowser, exists, isHidden, waitForAnimationEnd } from '../tools';
import ResponseHandler from '../helpers/response_handler';

let browser;
let page;
let responseHandler;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();
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

test('menu open favorite', async () => {
  await page.goto(APP_URL);
  await page.waitForSelector('.menu__button');

  await page.click('.menu__button');
  await page.waitForSelector('.menu__panel');
  await waitForAnimationEnd(page, '.menu__panel');
  await page.click('.menu__panel__action:nth-child(2)');

  expect(await exists(page, '.direction-panel')).toBeTruthy();

  await page.click('.menu__button');
  await page.waitForSelector('.menu__panel__action');
  await waitForAnimationEnd(page, '.menu__panel');
  await page.click('.menu__panel__action:nth-child(3)');

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
