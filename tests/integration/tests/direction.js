/* eslint-disable max-len */
import { initBrowser } from '../tools';
import ResponseHandler from '../helpers/response_handler';
const ROUTES_PATH = 'routes';
const mockAutocomplete = require('../../__data__/autocomplete.json');
const mockMapBox = require('../../__data__/mapbox.json');

let browser;
let page;
let responseHandler;

beforeAll(async () => {
  browser = (await initBrowser()).browser;
}, 60000);

beforeEach(async () => {
  page = await browser.newPage();
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();
}, 60000);

test('check "My position" label', async () => {
  expect.assertions(1);
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);

  // wait for autocomplete library starting-up
  await page.waitForSelector('#itinerary_input_origin');
  await page.click('#itinerary_input_origin');
  await page.waitForSelector('.itinerary_suggest_your_position');
  const yourPositionItem = await page.waitForSelector('.itinerary_suggest_your_position');
  expect(yourPositionItem).not.toBeNull();
});

test('switch start end', async () => {
  expect.assertions(1);
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);
  await page.waitForSelector('#itinerary_input_origin');
  // await page.click('#itinerary_input_origin');
  await page.type('#itinerary_input_origin', 'start');
  // await page.click('#itinerary_input_destination');
  await page.type('#itinerary_input_destination', 'end');
  await page.click('.itinerary_invert_origin_destination');
  const inputValues = await page.evaluate(() => {
    return {
      startInput: document.querySelector('#itinerary_input_origin').value,
      endInput: document.querySelector('#itinerary_input_destination').value,
    };
  });

  expect(inputValues).toEqual({ startInput: 'end', endInput: 'start' });
  // await page.waitFor(50000);
}, 60000);

// test('simple search', async () => {
//   expect.assertions(1);
//   responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=direction/);
//   responseHandler.addPreparedResponse(mockMapBox, /\/30\.0000000,5\.0000000;30\.0000000,5\.0000000/);
//   await page.goto(`${APP_URL}/${ROUTES_PATH}`);
//   await page.waitForSelector('#itinerary_input_origin');
//   await page.type('#itinerary_input_origin', 'direction');
//   // await page.waitFor(1000);
//   await page.keyboard.press('Enter');
//   await page.type('#itinerary_input_destination', 'direction');
//   // await page.waitFor(1000);
//   await page.keyboard.press('Enter');

//   // await page.waitFor(50000);

//   const leg0 = await page.waitForSelector('.itinerary_leg');

//   expect(leg0).not.toBeNull();
// }, 50000);

test('route flag', async () => {
  expect.assertions(3);
  await page.goto(`${APP_URL}/${ROUTES_PATH}`);

  await page.waitForSelector('#itinerary_input_origin');
  const smallToolBar = await page.waitForSelector('.top_bar--small');

  expect(smallToolBar).not.toBeNull();
  const directionStartInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_origin').value
  );
  expect(directionStartInput).toEqual('');
  const directionEndInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_destination').value
  );
  expect(directionEndInput).toEqual('');
});


test('destination', async () => {
  expect.assertions(3);
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?destination=latlon:47.4:7.5@Monoprix Nice`);

  await page.waitForSelector('#itinerary_input_origin');
  const smallToolBar = await page.waitForSelector('.top_bar--small');
  expect(smallToolBar).not.toBeNull();
  const directionStartInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_origin').value
  );
  expect(directionStartInput).toEqual('');

  const directionEndInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_destination').value
  );
  expect(directionEndInput).toEqual('Monoprix Nice');
});

test('origin & destination', async () => {
  expect.assertions(3);
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5@Monoprix Nice&destination=latlon:47.4:7.5@Franprix Cannes`);
  await page.waitForSelector('#itinerary_input_origin');
  const smallToolBar = await page.waitForSelector('.top_bar--small');

  expect(smallToolBar).not.toBeNull();
  const directionStartInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_origin').value
  );
  expect(directionStartInput).toEqual('Monoprix Nice');

  const directionEndInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_destination').value
  );
  expect(directionEndInput).toEqual('Franprix Cannes');
});

test('origin & destination & mode', async () => {
  expect.assertions(4);
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5@Monoprix Nice&destination=latlon:47.4:7.5974115&mode=walking`);

  await page.waitForSelector('#itinerary_input_origin');
  const smallToolBar = await page.waitForSelector('.top_bar--small');
  expect(smallToolBar).not.toBeNull();
  const directionStartInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_origin').value
  );
  expect(directionStartInput).toEqual('Monoprix Nice');

  const directionEndInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_destination').value
  );
  expect(directionEndInput).toEqual('47.40000 : 7.59741');

  const activeLabel = await page.evaluate(() => {
    return Array.from(document.querySelector('.itinerary_vehicle_button--active').classList).join(',');
  });
  expect(activeLabel).toContain('icon-foot');
});

// There is no current way with the MapBox-GL-mock to test changes of state or style
// on a feature. Let's disable this test it until we improve our map testing tools.
// test('select itinerary leg', async () => {
//   expect.assertions(1);
//   responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.0000000,6\.6000000/);
//   await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.0`);
//   await page.waitForSelector('#itinerary_leg_0');
//   page.click('#itinerary_leg_0');
//   await wait(300);
//
//   @TODO: test that the corresponing map feature gets the right state or style
// });

test('select itinerary step', async () => {
  expect.assertions(1);
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.1000000,47\.4000000/);
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:47.4:6.1`);

  await page.waitForSelector('.itinerary_leg');

  await page.click('.itinerary_leg_via_details');
  await page.click('.itinerary_roadmap_item:nth-of-type(2)');

  const center = await page.evaluate(() => {
    return window.MAP_MOCK.getCenter();
  });

  expect(center).toEqual({ 'lat': 48.823566, 'lng': 2.290454 });
});


test('show itinerary roadmap on mobile', async () => {
  await page.setViewport({
    width: 400,
    height: 800,
  });
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.1000000,47\.4000000/);
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:47.4:6.1`);

  await page.waitForSelector('.itinerary_leg');
  await page.click('.itinerary_leg .itinerary_leg_detailsBtn');
  await page.waitForSelector('.itinerary_legDetails');

  /*
    This simulates a user action that will close
    all panels related to the current itinerary,
    such as a click on a POI on the map.
  */
  await page.evaluate('window.app.navigateTo("/")');
  // Itinerary container should be disabled.
  await page.waitForSelector('.direction_panel', { hidden: true, timeout: 1000 });
});

test('api error handling', async () => {
  expect.assertions(1);
  /* prepare "error" response */
  responseHandler.addPreparedResponse({}, /\/7\.5000000,47\.4000000;6\.6000000,6\.6000000/, { status: 422 });
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.6`);
  const errorMessageHandler = await page.waitForSelector('.itinerary_no-result');
  expect(errorMessageHandler).not.toBeNull();
});

test('api wait effect', async () => {
  expect.assertions(2);
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.7000000,6\.6000000/, { delay: 250 });
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.7`);
  const placeholderHandler = await page.waitForSelector('.itinerary_leg--placeholder');
  expect(placeholderHandler).not.toBeNull();
  const firstLeg = await page.waitForSelector('.itinerary_leg:not(.itinerary_leg--placeholder)');
  expect(firstLeg).not.toBeNull();
});

afterAll(async () => {
  await browser.close();
});
