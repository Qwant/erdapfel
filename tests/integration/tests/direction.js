/* eslint-disable max-len */
import { initBrowser, simulateClickOnMap, getInputValue, exists } from '../tools';
import ResponseHandler from '../helpers/response_handler';
const ROUTES_PATH = 'routes';
const mockAutocomplete = require('../../__data__/autocomplete.json');
const mockDirections = require('../../__data__/directions.json');
const mockPoi1 = require('../../__data__/poi.json');
const mockPoi2 = require('../../__data__/poi2.json');
const mockLatlonPoi = require('../../__data__/latlonpoi.json');

let browser;
let page;
let responseHandler;

async function getInputValues(page) {
  return {
    origin: await getInputValue(page, '#direction-input_origin'),
    destination: await getInputValue(page, '#direction-input_destination'),
  };
}

beforeAll(async () => {
  browser = (await initBrowser()).browser;
});

beforeEach(async () => {
  page = await browser.newPage();
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();
  responseHandler.addPreparedResponse(mockPoi1, new RegExp(`places/${mockPoi1.id}`));
  responseHandler.addPreparedResponse(mockPoi2, new RegExp(`places/${mockPoi2.id}`));
  responseHandler.addPreparedResponse(mockLatlonPoi, new RegExp(`places/${mockLatlonPoi.id}`));
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete/);
  responseHandler.addPreparedResponse(mockDirections, /directions/);
});

describe('Form', () => {
  test('the direction form is initialized', async () => {
    await page.goto(`${APP_URL}/${ROUTES_PATH}`);
    await page.waitForSelector('#direction-input_origin');

    const fields = await getInputValues(page);
    expect(fields).toEqual({ origin: '', destination: '' });
  });

  test('destination point is set to the POI if coming from the POI panel CTA', async () => {
    await page.goto(`${APP_URL}/place/${mockPoi1.id}`);
    await page.waitForSelector('.poiTitle');
    await page.click('.poi_panel__actions .poi_panel__action__direction'); // Click on directions button
    await page.waitForSelector('#direction-input_destination');
    const destinationValue = await getInputValue(page, '#direction-input_destination');
    expect(destinationValue).toEqual("Musée d'Orsay");
  });

  test('origin/destination points can be set by suggest or click on map', async () => {
    await page.goto(`${APP_URL}/${ROUTES_PATH}`);
    await page.waitForSelector('#direction-input_origin');

    await page.type('#direction-input_origin', 'plop');
    await page.waitForSelector('.autocomplete_suggestions');
    await page.keyboard.press('Enter');

    await simulateClickOnMap(page, {
      lat: mockLatlonPoi.geometry.coordinates[1],
      lng: mockLatlonPoi.geometry.coordinates[0],
    });

    const fields = await getInputValues(page);
    expect(fields).toEqual({ origin: 'test result 1', destination: mockLatlonPoi.address.name });
  });

  test('a point can be passed in the URL, leaving the other empty', async () => {
    await page.goto(`${APP_URL}/${ROUTES_PATH}/?destination=${mockPoi1.id}`);
    await page.waitForSelector('#direction-input_origin');

    const fields = await getInputValues(page);
    expect(fields).toEqual({ origin: '', destination: mockPoi1.name });
  });

  test('both points and the mode can be passed by URL', async () => {
    const originName = mockPoi1.name;
    const destinationName = mockLatlonPoi.address.name;

    await page.goto(
      `${APP_URL}/${ROUTES_PATH}/?origin=${mockPoi1.id}&destination=${mockLatlonPoi.id}&mode=walking`
    );

    const fields = await getInputValues(page);
    expect(fields).toEqual({ origin: originName, destination: destinationName });

    const activeModeLabel = await page.evaluate(() =>
      Array.from(document.querySelector('.vehicleSelector-button--active').classList).join(',')
    );
    expect(activeModeLabel).toContain('--walking');
  });

  test('an itinerary is searched when both fields contain valid points', async () => {
    await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=${mockPoi1.id}&destination=${mockPoi2.id}`);

    expect(await exists(page, '.itinerary_leg')).toBeTruthy();
  });

  test('origin and destination points can be swapped', async () => {
    await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=${mockPoi1.id}&destination=${mockPoi2.id}`);
    const beforeSwap = await getInputValues(page);
    expect(beforeSwap).toEqual({ origin: mockPoi1.name, destination: mockPoi2.name });

    await page.click('.direction-invert-button');
    const afterSwap = await getInputValues(page);
    expect(afterSwap).toEqual({ origin: beforeSwap.destination, destination: beforeSwap.origin });
  });
});

describe('Result', () => {
  test('errors/no results are handled', async () => {
    // override default response with error
    responseHandler.addPreparedResponse({}, /directions/, { status: 422 });
    await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.6`);
    expect(await exists(page, '.itinerary_no-result')).toBeTruthy();
  });

  test('a loading effect is shown while waiting for the results', async () => {
    // override default response with delayed response
    responseHandler.addPreparedResponse(mockDirections, /directions/, { delay: 1000 });
    await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.7`);
    expect(await exists(page, '.itinerary_leg--placeholder')).toBeTruthy();
    expect(await exists(page, '.itinerary_leg:not(.itinerary_leg--placeholder)')).toBeTruthy();
  });

  // test('the user can center the map on an itinerary step', async () => {
  //   await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.7`);
  //   await page.waitForSelector('.itinerary_leg');
  //   // open the roadmap details
  //   await page.click('.itinerary_leg_detailsBtn');
  //   // click the second item of the roadmap
  //   await page.click('.itinerary_roadmap_item + .divider + .itinerary_roadmap_item');

  //   const { center } = await getMapView(page);
  //   expect(center).toEqual({ lat: 48.823566, lng: 2.290454 });
  // });
});

afterAll(async () => {
  await browser.close();
});
