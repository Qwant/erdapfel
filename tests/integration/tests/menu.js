import { clearStore, initBrowser } from '../tools';
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
  expect.assertions(3);
  await page.goto(APP_URL);
  page.waitForSelector('.menu__button');
  let panel = await page.waitForSelector('.menu__panel', { hidden: true });
  expect(panel).toBeNull();

  await page.click('.menu__button');
  panel = await page.waitForSelector('.menu__panel', { visible: true });
  expect(panel).not.toBeNull();

  await page.click('.menu__panel__top__close');
  panel = await page.waitForSelector('.menu__panel', { hidden: true });
  expect(panel).toBeNull();
});

test('menu open favorite', async () => {
  expect.assertions(2);
  await page.goto(APP_URL);
  page.waitForSelector('.menu__button');

  page.click('.menu__button');
  await page.waitForSelector('.menu__panel');
  page.click('.menu__panel__action:nth-child(2)');

  const itinerary = await page.waitForSelector('.direction_panel');
  expect(itinerary).not.toBeNull();

  page.click('.menu__button');
  await page.waitForSelector('.menu__panel__action');
  page.click('.menu__panel__action:nth-child(3)');
  await page.waitFor(300);

  const favorites = await page.waitForSelector('.favorite_panel');
  expect(favorites).not.toBeNull();
});

test('close service panel when opening direction', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  await page.click('.service_panel__item__direction');
  const servicePanelClose = await page.waitForSelector('.service_panel', { hidden: true });
  expect(servicePanelClose).toBeNull();
});

afterEach(async () => {
  await clearStore(page);
});

afterAll(async () => {
  await browser.close();
});
