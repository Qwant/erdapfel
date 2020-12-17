import { clearStore, initBrowser, getMapView, exists } from '../tools';
import AutocompleteHelper from '../helpers/autocomplete';
import ResponseHandler from '../helpers/response_handler';
const configBuilder = require('@qwant/nconf-builder');
const config = configBuilder.get_without_check();

const SUGGEST_MAX_ITEMS = config.services.geocoder.maxItems;

let browser;
let page;
let autocompleteHelper;
let responseHandler;
const mockAutocomplete = require('../../__data__/autocomplete.json');
const mockAutocompleteAllTypes = require('../../__data__/autocomplete_type.json');
const mockPoi = require('../../__data__/poi.json');

beforeAll(async () => {
  browser = (await initBrowser()).browser;
});

beforeEach(async () => {
  page = await browser.newPage();
  autocompleteHelper = new AutocompleteHelper(page);
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();
  responseHandler.addPreparedResponse(mockPoi, /places\/*/);
});

test('search and clear', async () => {
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/);
  await page.goto(APP_URL);
  await autocompleteHelper.typeAndWait('Hello');
  expect(await exists(page, '#clear_button_desktop')).toBeTruthy();

  const autocompleteItems = await autocompleteHelper.getSuggestList();
  expect(autocompleteItems.length).toEqual(SUGGEST_MAX_ITEMS);

  const searchValue = await autocompleteHelper.getSearchInputValue();
  expect(searchValue).toEqual('Hello');

  await page.click('#clear_button_desktop');
  const searchValueAfterClear = await autocompleteHelper.getSearchInputValue();
  expect(searchValueAfterClear).toEqual('');
});

// http://idunn_test.test/v1/pois/osm:node:4872758213?lang=fr
test('submit key', async () => {
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/);
  await page.goto(APP_URL);
  /* submit with data already loaded */
  await autocompleteHelper.typeAndWait('Hello');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.autocomplete_suggestions', { hidden: true });

  const { center } = await getMapView(page);

  let firstFeatureCenter = mockAutocomplete.features[0].geometry.coordinates;
  expect(center).toEqual({ lat: firstFeatureCenter[1], lng: firstFeatureCenter[0] });
  await page.click('#clear_button_desktop');

  /* force specific query */
  responseHandler.addPreparedResponse(mockAutocompleteAllTypes, /autocomplete\?q=paris/);
  await autocompleteHelper.typeAndWait('paris');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.autocomplete_suggestions', { hidden: true });

  await page.waitFor(300);

  const { center: newCenter } = await getMapView(page);
  firstFeatureCenter = mockAutocompleteAllTypes.features[0].geometry.coordinates;
  expect(newCenter).toEqual({ lat: firstFeatureCenter[1], lng: firstFeatureCenter[0] });
});

afterEach(async () => {
  await clearStore(page);
  responseHandler.reset();
});

afterAll(async () => {
  await browser.close();
});
