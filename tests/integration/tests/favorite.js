/* globals Poi */
const configBuilder = require('@qwant/nconf-builder');
const config = configBuilder.get();
const APP_URL = `http://localhost:${config.PORT}`;
import { initBrowser, wait, clearStore } from '../tools';
import { toggleFavoritePanel } from '../favorites_tools';

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
  await page.waitForSelector('.side_panel__container', { visible: true });
  expect(await page.evaluate(() => {
    return document.getElementsByClassName('.favorites_container').length;
  })).toEqual(0);
  await toggleFavoritePanel(page);
  const favPanel = await page.waitForSelector('.favorites_container', { visible: true });
  expect(favPanel).toBeTruthy();
});

test('favorite added is present in favorite panel', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  page.evaluate(() => {
    fire('store_poi', new Poi(1, 'some poi', '', { lat: 43, lng: 2 }, '', '', []));
  });
  await toggleFavoritePanel(page);
  const items = await page.waitForSelector('.favorite_panel__items');
  expect(items).not.toBeNull();
});

test('restore favorite from localStorage', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  const testTitle = 'demo_fav';
  page.evaluate(testTitle => {
    fire('store_poi', new Poi(1, testTitle, '', { lat: 43, lng: 2 }, '', '', []));
  }, testTitle);
  await wait(100);
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
  await page.evaluate(() => {
    fire('store_poi', new Poi(1, 'some poi i will remove', '', { lat: 43, lng: 2 }, '', '', []));
  });
  await toggleFavoritePanel(page);
  let items = await page.waitForSelector('.favorite_panel__items');

  expect(items).not.toBeNull();

  /* remove it */

  await page.waitForSelector('.favorite_panel__item__more_button');
  await page.click('.favorite_panel__item__more_button');
  await page.click('.favorite_panel__item__more__line:nth-child(2)');

  items = await page.waitForSelector('.favorite_panel__container__empty');
  expect(items).not.toBeNull();
});

test('center map after a favorite poi click', async () => {
  await page.goto(APP_URL);
  await page.evaluate(() => {
    window.MAP_MOCK.flyTo({ center: { lat: 10, lng: 0 }, zoom: 10 });
  });
  const favoriteMockCoordinates = { lat: 43.5, lng: 7.18 };
  await page.evaluate(storeCoordinate => {
    fire(
      'store_poi',
      new Poi(1, 'some poi i will click', 'second line', 'poi', storeCoordinate, '', '')
    );
  }, favoriteMockCoordinates);

  await toggleFavoritePanel(page);
  await page.waitForSelector('.favorite_panel__item__more_container');
  await page.click('.favorite_panel__item__more_container');
  const center = await page.evaluate(() => {
    return window.MAP_MOCK.getCenter();
  });

  expect(center).toEqual({ lng: favoriteMockCoordinates.lng, lat: favoriteMockCoordinates.lat });
});

afterEach(async () => {
  await clearStore(page);
});

afterAll(async () => {
  await browser.close();
});
