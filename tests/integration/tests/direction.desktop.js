/* eslint-disable max-len */
import { initBrowser, exists, isHidden } from '../tools';
import ResponseHandler from '../helpers/response_handler';
const ROUTES_PATH = 'routes';
const mockAutocomplete = require('../../__data__/autocomplete.json');
const mockPoi = require('../../__data__/poi.json');
const mockDirections = require('../../__data__/directions.json');

let browser;
let page;
let responseHandler;

beforeAll(async () => {
  browser = (await initBrowser()).browser;
});

beforeEach(async () => {
  page = await browser.newPage();
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();
});

test('close service panel when opening direction', async () => {
  await page.goto(APP_URL);
  await page.click('.search_form__direction_shortcut');
  expect(await isHidden(page, '.service_panel')).toBeTruthy();
});

test('check "My position" label', async () => {
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);

  // wait for autocomplete library starting-up
  await page.click('#direction-input_origin');
  await page.waitForSelector('.autocomplete_suggestions');

  expect(await exists(page, '.autocomplete_suggestion--geoloc')).toBeTruthy();
});

describe('Close panel behavior', () => {
  test('returning to home if not coming from a POI', async () => {
    await page.goto(APP_URL);
    const directionButton = await page.waitForSelector('.search_form__direction_shortcut');
    await directionButton.click();
    await page.waitForSelector('.direction-panel');
    await page.click('.vehicleSelector-button:not(.vehicleSelector-button--active)');
    await page.click('.direction-panel .closeButton');
    expect(await exists(page, '.service_panel')).toBeTruthy();
  });

  test('returning to the POI Panel if coming from the "Directions" button of a POI', async () => {
    await page.goto(
      `${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=16.50/48.8602571/2.3262281`
    );
    const directionFromPOIButton = await page.waitForSelector('.poi_panel__action__direction');
    await directionFromPOIButton.click();
    await page.waitForSelector('.direction-panel');
    await page.click('.vehicleSelector-button:not(.vehicleSelector-button--active)');
    await page.click('.direction-panel .closeButton');
    expect(await exists(page, '.poi_panel')).toBeTruthy();
  });

  test('navigating back after manipulating results directly exits the direction panel', async () => {
    responseHandler.addPreparedResponse(mockPoi, new RegExp(`places/${mockPoi.id}`));
    await page.goto(
      `${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=16.50/48.8602571/2.3262281`
    );
    const directionFromPOIButton = await page.waitForSelector('.poi_panel__action__direction');
    await directionFromPOIButton.click();
    await page.waitForSelector('.direction-panel');

    responseHandler.addPreparedResponse(mockDirections, /directions/);
    responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=direction/);
    await page.type('#direction-input_origin', 'direction');
    await page.keyboard.press('Enter');

    await page.waitForSelector('.itinerary_leg');
    await page.click('.itinerary_leg_detailsBtn');
    await page.waitForSelector('.itinerary_roadmap');

    await page.evaluate('window.history.back()');
    expect(await exists(page, '.poi_panel')).toBeTruthy();
  });
});

afterAll(async () => {
  await browser.close();
});
