/* eslint-disable max-len */
import { initBrowser } from '../tools';
import ResponseHandler from '../helpers/response_handler';
const ROUTES_PATH = 'routes';
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

test('show itinerary roadmap on mobile', async () => {
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.1000000,47\.4000000/);
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:47.4:6.1`);

  await page.waitForSelector('.itinerary_leg');
  await page.click('.itinerary_leg .itinerary_leg_detailsBtn');
  await page.waitForSelector('.mobile-route-details');

  /*
    This simulates a user action that will close
    all panels related to the current itinerary,
    such as a click on a POI on the map.
  */
  await page.evaluate('window.app.navigateTo("/")');
  // Itinerary container should be disabled.
  await page.waitForSelector('.direction-panel', { hidden: true, timeout: 1000 });
});

afterAll(async () => {
  await browser.close();
});
