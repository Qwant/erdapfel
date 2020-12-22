/* eslint-disable max-len */
import { initBrowser, exists, isHidden } from '../tools';
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

describe('Mobile itinerary details', () => {
  test('show/hide itinerary roadmap on mobile', async () => {
    responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.1000000,47\.4000000/);
    await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5&destination=latlon:47.4:6.1`);

    await page.waitForSelector('.itinerary_leg');
    await page.click('.itinerary_leg .itinerary_leg_detailsBtn');
    await page.waitForSelector('.mobile-route-details');
    expect(await exists(page, '.mobile-route-details')).toBeTruthy();

    await page.evaluate('window.history.back()');
    expect(await isHidden(page, '.mobile-route-details')).toBeTruthy();
    expect(await exists(page, '.direction-panel')).toBeTruthy();

    await page.evaluate('window.history.back()');
    expect(await isHidden(page, '.direction-panel')).toBeTruthy();
  });
});

afterAll(async () => {
  await browser.close();
});
