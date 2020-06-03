import { initBrowser, clearStore } from '../tools';
import { toggleFavoritePanel, storePoi } from '../favorites_tools';

let browser;
let page;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
});

test('toggle favorite panel', async () => {
  expect.assertions(2);
  await page.goto(APP_URL);
  await page.waitForSelector('.panel_container', { visible: true });
  expect(await page.evaluate(() => {
    return document.getElementsByClassName('.favorite_panel').length;
  })).toEqual(0);
  await toggleFavoritePanel(page);
  const favPanel = await page.waitForSelector('.favorite_panel', { visible: true });
  expect(favPanel).toBeTruthy();
});

test('favorite added is present in favorite panel', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  await storePoi(page, { title: 'some poi' });
  await toggleFavoritePanel(page);
  const items = await page.waitForSelector('.favorite_panel__items');
  expect(items).not.toBeNull();
});

test('restore favorite from localStorage', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  const testTitle = 'demo_fav';
  await storePoi(page, { title: testTitle });
  await page.click('.service_panel__item__fav');
  await page.waitForSelector('.favorite_panel__item__title');
  const title = await page.evaluate(() => {
    return document.querySelector('.favorite_panel__item__title').innerText;
  });
  expect(title.trim()).toEqual(testTitle);
});

test('remove favorite using favorite panel', async () => {
  expect.assertions(2);
  await page.goto(APP_URL);
  await storePoi(page, { title: 'some poi i will remove' });
  await toggleFavoritePanel(page);
  let items = await page.waitForSelector('.favorite_panel__items');
  expect(items).not.toBeNull();

  /* remove it */
  await page.waitForSelector('.favorite_panel__item__delete');
  await page.click('.favorite_panel__item__delete');

  items = await page.waitForSelector('.favorite_panel__container__empty');
  expect(items).not.toBeNull();
});

test('center map after a favorite poi click', async () => {
  await page.goto(APP_URL);
  await page.evaluate(() => {
    window.MAP_MOCK.flyTo({ center: { lat: 10, lng: 0 }, zoom: 10 });
  });
  const favoritePoiCoordinates = { lat: 43.5, lng: 7.18 };
  await storePoi(page, { coords: favoritePoiCoordinates });
  await toggleFavoritePanel(page);
  await page.waitForSelector('.favorite_panel__item__title');
  await page.click('.favorite_panel__item__title');
  const center = await page.evaluate(() => window.MAP_MOCK.getCenter());
  expect(center).toEqual(favoritePoiCoordinates);
});

afterEach(async () => {
  await clearStore(page);
});

afterAll(async () => {
  await browser.close();
});
