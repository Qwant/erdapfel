/* eslint-disable max-len */
import { initBrowser, getInputValue, exists, isHidden } from '../tools';
import ResponseHandler from '../helpers/response_handler';
const ROUTES_PATH = 'routes';
const mockAutocomplete = require('../../__data__/autocomplete.json');
const mockMapBox = require('../../__data__/mapbox.json');

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

test('check "My position" label', async () => {
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);

  // wait for autocomplete library starting-up
  await page.click('#direction-input_origin');
  await page.waitForSelector('.autocomplete_suggestions');

  expect(await exists(page, '.autocomplete_suggestion--geoloc')).toBeTruthy();
});

test('switch start end', async () => {
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);
  await page.waitForSelector('#direction-input_origin');
  await page.type('#direction-input_origin', 'start');
  await page.type('#direction-input_destination', 'end');
  await page.click('.direction-invert-button');
  const inputValues = {
    startInput: await getInputValue(page, '#direction-input_origin'),
    endInput: await getInputValue(page, '#direction-input_destination'),
  };
  expect(inputValues).toEqual({ startInput: 'end', endInput: 'start' });
});

test('simple search', async () => {
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=direction/);
  responseHandler.addPreparedResponse(mockMapBox, /\/30\.0000000,5\.0000000;30\.0000000,5\.0000000/);
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);
  expect(await isHidden(page, '.direction-panel-share-button')).toBeTruthy();
  await page.waitForSelector('#direction-input_origin');
  await page.type('#direction-input_origin', 'direction');
  await page.keyboard.press('Enter');
  await page.type('#direction-input_destination', 'direction');
  await page.keyboard.press('Enter');
  expect(await page.waitForSelector('.direction-panel-share-button', { visible: true })).toBeTruthy();
  expect(await exists(page, '.itinerary_leg')).toBeTruthy();
});

describe('Close panel behavior', () => {
  test('returning to home', async () => {
    await page.goto(APP_URL);
    const directionButton = await page.waitForSelector('.search_form__direction_shortcut');
    await directionButton.click();
    await page.waitForSelector('.direction-panel');
    await page.click('.vehicleSelector-button:not(.vehicleSelector-button--active)');
    await page.click('.direction-panel .closeButton');
    expect(await exists(page, '.service_panel')).toBeTruthy();
  });

  test('returning to the POI', async () => {
    await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=16.50/48.8602571/2.3262281`);
    const directionFromPOIButton = await page.waitForSelector('.poi_panel__action__direction');
    await directionFromPOIButton.click();
    await page.waitForSelector('.direction-panel');
    await page.click('.vehicleSelector-button:not(.vehicleSelector-button--active)');
    await page.click('.direction-panel .closeButton');
    expect(await exists(page, '.poi_panel')).toBeTruthy();
  });
});

afterAll(async () => {
  await browser.close();
});
