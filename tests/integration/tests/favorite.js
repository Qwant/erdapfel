import { initBrowser, clearStore, getMapView, exists } from '../tools';
import { toggleFavoritePanel, storePoi } from '../favorites_tools';

let browser;
let page;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
});

test('toggle favorite panel', async () => {
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
  await page.goto(APP_URL);
  await storePoi(page, { title: 'some poi' });
  await toggleFavoritePanel(page);
  expect(await exists(page, '.favorite_panel__items')).toBeTruthy();
});

test('restore favorite from localStorage', async () => {
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
  await page.goto(APP_URL);
  await storePoi(page, { title: 'some poi i will remove' });
  await toggleFavoritePanel(page);
  expect(await exists(page, '.favorite_panel__items')).toBeTruthy();

  /* remove it */
  await page.waitForSelector('.favorite_panel__item__delete');
  await page.click('.favorite_panel__item__delete');

  expect(await exists(page, '.favorite_panel__container__empty')).toBeTruthy();
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
  const { center } = await getMapView(page);
  expect(center).toEqual(favoritePoiCoordinates);
});

afterEach(async () => {
  await clearStore(page);
});

afterAll(async () => {
  await browser.close();
});
