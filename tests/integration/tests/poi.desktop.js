const poiMock = require('../../__data__/poi.json');

import ResponseHandler from '../helpers/response_handler';
import { initBrowser, clearStore, exists } from '../tools';
import { getFavorites, toggleFavoritePanel } from '../favorites_tools';

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
    'accept-language': 'fr_FR,fr,en;q=0.8', /* force fr header */
  });
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();

  const autocompleteMock = require('../../__data__/autocomplete.json');
  responseHandler.addPreparedResponse(autocompleteMock, /autocomplete/);
  responseHandler.addPreparedResponse(poiMock, /places\/osm:way:63178753(\?[^?]*)?$/);
});

test('display details about the poi on a poi click', async () => {
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/48.8605833/2.3261037`);
  await page.waitForSelector('.poiTitle');

  await page.click('.poi_panel__content .poiItem');
  let infoTitle = await page.evaluate(() => {
    return document.querySelector('.poi_panel__sub_block__title').innerText;
  });
  expect(infoTitle.trim()).toEqual('Accessible en fauteuil roulant.');
  await page.click('.poi_panel__block__collapse');

  infoTitle = await page.evaluate(() => {
    return document.querySelector('.poi_panel__sub_block__title').innerText;
  });
  expect(infoTitle.trim()).toEqual('');

  const { address, contact, contactUrl, phone, website } = await page.evaluate(() => {
    return {
      address: document.querySelector('.block-address .block-value').innerText,
      contact: document.querySelector('.block-contact-link').innerText,
      contactUrl: document.querySelector('.block-contact-link').href,
      phone: document.querySelector('.block-phone').innerText,
      website: document.querySelector('.block-website').innerText,
    };
  });
  expect(address).toEqual('1 Rue de la Légion d\'Honneur, 75007 Paris');
  expect(await exists(page, '.poi_panel .openingHour--closed')).toBeTruthy();
  expect(phone).toMatch('01 40 49 48 14');
  expect(website).toMatch('www.musee-orsay.fr');
  expect(contactUrl).toMatch('mailto:admin@orsay.fr');
  expect(contact).toMatch('admin@orsay.fr');
  expect(await exists(page, '.poi_panel__info__wiki')).toBeTruthy();
});

async function clickPoi(page) {
  const mapPoiMock = {
    properties: {
      global_id: poiMock.id,
      name: poiMock.name,
    },
    geometry: poiMock.geometry,
  };
  await page.evaluate(clickedFeature => {
    window.map.clickOnMap({}, clickedFeature);
  }, mapPoiMock);
  const mockPoiBounds = await page.$('#mock_poi').then(e => e.boundingBox());
  // Click on the top-left corner
  await page.mouse.click(mockPoiBounds.x, mockPoiBounds.y);
}

test('add a poi as favorite and find it back in the favorite menu', async () => {
  await page.goto(APP_URL);

  // we select a poi and 'star' it
  await clickPoi(page);
  expect(await exists(page, '.poiTitle')).toBeTruthy();
  expect(await exists(page, '.poi_panel')).toBeTruthy();
  await page.click('.poi_panel__actions .poi_panel__action__favorite');
  await page.click('.poi_panel .closeButton');
  // we check that the first favorite item is our poi
  await toggleFavoritePanel(page);
  let fav = await getFavorites(page);
  expect(fav).toHaveLength(1);
  expect(fav[0].title).toEqual('Musée d\'Orsay');
  expect(fav[0].desc).toEqual('Musée');
  expect(fav[0].icons).toContainEqual('icon-museum');

  // we then reopen the poi panel and 'unstar' the poi.
  await page.click('.favorite_panel__item');
  expect(await exists(page, '.poiTitle')).toBeTruthy();
  expect(await exists(page, '.poi_panel')).toBeTruthy();

  await page.click('.poi_panel__actions .poi_panel__action__favorite');
  await page.click('.poi_panel .closeButton');
  // it should disappear from the favorites
  await toggleFavoritePanel(page);
  fav = await getFavorites(page);
  expect(fav).toEqual([]);
});

afterEach(async () => {
  try {
    await clearStore(page); /* if only the above test is run page is not used */
  } catch (e) {
    console.error(e);
  }
});

afterAll(async () => {
  await browser.close();
});

