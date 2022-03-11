const poiMock = require('../../__data__/poi.json');
import ResponseHandler from '../helpers/response_handler';
import { initBrowser, clearStore, getMapView, exists, waitForAnimationEnd } from '../tools';
import { toggleFavoritePanel, storePoi, getFavorites } from '../favorites_tools';

let browser;
let page;
let responseHandler;

beforeAll(async () => {
  browser = (await initBrowser()).browser;
});

beforeEach(async () => {
  page = await browser.newPage();
  page.setDefaultTimeout(3000);
  await page.setExtraHTTPHeaders({
    'accept-language': 'fr_FR,fr,en;q=0.8' /* force fr header */,
  });
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();
  responseHandler.addPreparedResponse(poiMock, new RegExp(`places/${poiMock.id}`));
});

test('toggle favorite panel', async () => {
  await page.goto(APP_URL);
  await page.waitForSelector('.panel_container', { visible: true });
  expect(
    await page.evaluate(() => {
      return document.getElementsByClassName('.favorite_panel').length;
    })
  ).toEqual(0);
  await toggleFavoritePanel(page);
  const favPanel = await page.waitForSelector('.favorite_panel', { visible: true });
  expect(favPanel).toBeTruthy();
});

test('favorite added is present in favorite panel', async () => {
  await page.goto(APP_URL);
  const testTitle = 'demo_fav';
  await storePoi(page, { title: testTitle });
  await toggleFavoritePanel(page);
  await page.waitForSelector('.favorite_panel__item__title');
  const title = await page.evaluate(() => {
    return document.querySelector('.favorite_panel__item__title').innerText;
  });
  expect(title.trim()).toEqual(testTitle);
});

test('add/remove a favorite from the POI panel', async () => {
  await page.goto(`${APP_URL}/place/${poiMock.id}`);
  await page.waitForSelector('.poi_panel__actions');
  await page.click('.poi_panel__actions .poi_panel__action__favorite');

  if (process.env.TEST_DEVICE === 'mobile') {
    await page.click('.search_form__clear');
    await page.waitForSelector('.service_panel');
  }

  await toggleFavoritePanel(page);
  let fav = await getFavorites(page);
  expect(fav).toHaveLength(1);
  expect(fav[0].title).toEqual("Musée d'Orsay");
  expect(fav[0].desc).toEqual('Musée');
  expect(fav[0].icons).toContainEqual('icon-museum');

  // we then reopen the poi panel and 'unstar' the poi.
  await page.click('.favorite_panel__item');
  await page.waitForSelector('.poi_panel__actions');
  await waitForAnimationEnd(page, '.panel');
  await page.click('.poi_panel__actions .poi_panel__action__favorite');

  if (process.env.TEST_DEVICE === 'mobile') {
    await page.click('.search_form__clear');
    await page.waitForSelector('.service_panel');
  }
  // it should disappear from the favorites
  await toggleFavoritePanel(page);
  fav = await getFavorites(page);
  expect(fav).toEqual([]);
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
    window.map.mb.flyTo({ center: { lat: 10, lng: 0 }, zoom: 10 });
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
