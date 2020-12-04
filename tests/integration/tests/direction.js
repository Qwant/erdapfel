/* eslint-disable max-len */
import { initBrowser, simulateClickOnMap, getInputValue, getMapView, exists } from '../tools';
import ResponseHandler from '../helpers/response_handler';
const ROUTES_PATH = 'routes';
const mockAutocomplete = require('../../__data__/autocomplete.json');
const mockMapBox = require('../../__data__/mapbox.json');
const mockPoi1 = require('../../__data__/poi.json');
const mockPoi2 = require('../../__data__/poi2.json');
const mockLatlonPoi = require('../../__data__/latlonpoi.json');

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

test('Start/end inputs are correctly filled', async () => {
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);
  await page.waitForSelector('#direction-input_origin');

  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=plop/);
  await page.type('#direction-input_origin', 'plop');
  await page.waitForSelector('.autocomplete_suggestions');
  await page.keyboard.press('Enter');

  const directionStartInput = await getInputValue(page, '#direction-input_origin');
  expect(directionStartInput).toEqual('test result 1');

  responseHandler.addPreparedResponse(mockLatlonPoi, new RegExp('latlon:43.70324:7.25997'));
  await simulateClickOnMap(page, { lat: 43.70324, lng: 7.25997 });
  const directionEndInput = await getInputValue(page, '#direction-input_destination');
  expect(directionEndInput).toEqual('16 Avenue Thiers');
});

test('route flag', async () => {
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);

  await page.waitForSelector('#direction-input_origin');

  const directionStartInput = await getInputValue(page, '#direction-input_origin');
  expect(directionStartInput).toEqual('');

  const directionEndInput = await getInputValue(page, '#direction-input_destination');
  expect(directionEndInput).toEqual('');
});

test('destination', async () => {
  responseHandler.addPreparedResponse(mockPoi1, new RegExp(`places/${mockPoi1.id}`));

  await page.goto(`${APP_URL}/${ROUTES_PATH}/?destination=${mockPoi1.id}`);
  await page.waitForSelector('#direction-input_origin');

  const directionStartInput = await getInputValue(page, '#direction-input_origin');
  expect(directionStartInput).toEqual('');

  const directionEndInput = await getInputValue(page, '#direction-input_destination');
  expect(directionEndInput).toEqual(mockPoi1.name);
});

test('origin & destination', async () => {
  responseHandler.addPreparedResponse(mockPoi1, new RegExp(`places/${mockPoi1.id}`));
  responseHandler.addPreparedResponse(mockPoi2, new RegExp(`places/${mockPoi2.id}`));

  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=${mockPoi1.id}&destination=${mockPoi2.id}`);
  await page.waitForSelector('#direction-input_origin');

  const directionStartInput = await getInputValue(page, '#direction-input_origin');
  expect(directionStartInput).toEqual(mockPoi1.name);

  const directionEndInput = await getInputValue(page, '#direction-input_destination');
  expect(directionEndInput).toEqual(mockPoi2.name);
});

test('origin & latlon destination & mode', async () => {
  responseHandler.addPreparedResponse(mockPoi1, new RegExp(`places/${mockPoi1.id}`));
  responseHandler.addPreparedResponse(mockLatlonPoi, new RegExp(`places/${mockLatlonPoi.id}`));

  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=${mockPoi1.id}&destination=${mockLatlonPoi.id}&mode=walking`);
  await page.waitForSelector('#direction-input_origin');

  const directionStartInput = await getInputValue(page, '#direction-input_origin');
  expect(directionStartInput).toEqual(mockPoi1.name);

  const directionEndInput = await getInputValue(page, '#direction-input_destination');
  expect(directionEndInput).toEqual('16 Avenue Thiers');

  const activeLabel = await page.evaluate(() => {
    return Array.from(document.querySelector('.vehicleSelector-button--active .vehicleSelector-buttonIcon').classList).join(',');
  });
  expect(activeLabel).toContain('icon-foot');
});

// There is no current way with the MapBox-GL-mock to test changes of state or style
// on a feature. Let's disable this test it until we improve our map testing tools.
// test('select itinerary leg', async () => {
//   responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.0000000,6\.6000000/);
//   await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.0`);
//   await page.waitForSelector('#itinerary_leg_0');
//   page.click('#itinerary_leg_0');
//   await wait(300);
//
//   @TODO: test that the corresponing map feature gets the right state or style
// });

test('select itinerary step', async () => {
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.1000000,47\.4000000/);
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:47.4:6.1`);

  await page.waitForSelector('.itinerary_leg');

  await page.click('.itinerary_leg_detailsBtn');
  // click the second item of the roadmap
  await page.click('.itinerary_roadmap_item + .divider + .itinerary_roadmap_item');

  const { center } = await getMapView(page);
  expect(center).toEqual({ 'lat': 48.823566, 'lng': 2.290454 });
});

test('api error handling', async () => {
  /* prepare "error" response */
  responseHandler.addPreparedResponse({}, /\/7\.5000000,47\.4000000;6\.6000000,6\.6000000/, { status: 422 });
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.6`);
  expect(await exists(page, '.itinerary_no-result')).toBeTruthy();
});

test('api wait effect', async () => {
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.7000000,6\.6000000/, { delay: 1000 });
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.7`);
  expect(await exists(page, '.itinerary_leg--placeholder')).toBeTruthy();
  expect(await exists(page, '.itinerary_leg:not(.itinerary_leg--placeholder)')).toBeTruthy();
});

afterAll(async () => {
  await browser.close();
});
