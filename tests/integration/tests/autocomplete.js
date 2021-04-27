import { clearStore, initBrowser, getMapView, exists } from '../tools';
import { storePoi } from '../favorites_tools';
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
const mockAutocompleteEmpty = require('../../__data__/autocomplete_empty.json');
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

test('search with no suggest', async () => {
  responseHandler.addPreparedResponse(mockAutocompleteEmpty, /autocomplete\?q=Goodbye/);
  await page.goto(APP_URL);
  await autocompleteHelper.typeAndWait('Goodbye');
  expect(await exists(page, '.autocomplete_error')).toBeTruthy();
});

test('search has lang in query', async () => {
  const langPage = await browser.newPage();
  await langPage.setDefaultTimeout(2000); // to raise Puppeteer timeout early on fail
  await langPage.setExtraHTTPHeaders({
    'accept-language': 'de,en;q=0.8',
  });
  const responseHandler = await ResponseHandler.init(langPage);
  const autocompleteHelper = new AutocompleteHelper(langPage);

  const query = 'Frankreich';
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Frankreich(.*)&lang=de/);

  await langPage.goto(APP_URL);
  await autocompleteHelper.typeAndWait(query);
  const autocompleteItems = await autocompleteHelper.getSuggestList();
  expect(autocompleteItems).toHaveLength(SUGGEST_MAX_ITEMS);
});

test('search with focus on current map position', async () => {
  const page = await browser.newPage();
  await page.setDefaultTimeout(2000);
  const responseHandler = await ResponseHandler.init(page);
  const autocompleteHelper = new AutocompleteHelper(page);

  const query = 'townhall';
  responseHandler.addPreparedResponse(
    mockAutocomplete,
    /autocomplete\?q=townhall(.*)&lat=45(.*)&lon=5/
  );

  await page.goto(APP_URL);
  await page.evaluate(() => {
    window.map.mb.flyTo({ center: { lat: 45, lng: 5 }, zoom: 15, animate: false });
  });
  await autocompleteHelper.typeAndWait(query);
  const autocompleteItems = await autocompleteHelper.getSuggestList();
  expect(autocompleteItems).toHaveLength(SUGGEST_MAX_ITEMS);
});

test('keyboard navigation', async () => {
  const TypedSearch = 'Hello';
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete/);
  await page.goto(APP_URL);
  await autocompleteHelper.typeAndWait(TypedSearch);
  await page.waitFor(100);
  await autocompleteHelper.pressDown();
  await page.waitFor(100);
  await autocompleteHelper.pressDown();

  let selectElemPosition = await autocompleteHelper.getSelectedElementPos();

  /* second item is selected */
  expect(selectElemPosition).toEqual(1);

  /* search value is the second item label */
  const searchValue = await autocompleteHelper.getSearchInputValue();
  const expectedLabelName = mockAutocomplete.features[1].properties.geocoding.name;

  expect(searchValue.trim()).toEqual(expectedLabelName);

  /* got to last item */
  for (let i = 0; i < SUGGEST_MAX_ITEMS - 2; i++) {
    await page.waitFor(100);
    await autocompleteHelper.pressDown();
  }
  await page.waitFor(100);
  /* one step more */
  await autocompleteHelper.pressDown();

  selectElemPosition = await autocompleteHelper.getSelectedElementPos();

  /* nothing is selected */
  expect(selectElemPosition).toEqual(-1);

  /* search value is reset to typed word */
  const originalSearchValue = await autocompleteHelper.getSearchInputValue();
  expect(originalSearchValue.trim()).toEqual(TypedSearch);

  await page.waitFor(100);
  await autocompleteHelper.pressDown();
  await page.waitFor(100);
  /* fist element is selected */
  selectElemPosition = await autocompleteHelper.getSelectedElementPos();
  expect(selectElemPosition).toEqual(0);

  /* select suggestion via Enter, should close the container */
  await page.keyboard.press('Enter');
  await page.waitForSelector('div.autocomplete_suggestions', { hidden: true });

  /* type another char */
  await autocompleteHelper.typeAndWait('a');
  await page.waitFor(100);
  selectElemPosition = await autocompleteHelper.getSelectedElementPos();
  expect(selectElemPosition).toEqual(-1);
});

test('mouse navigation', async () => {
  const TypedSearch = 'Hello';
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/);
  await page.goto(APP_URL);
  await autocompleteHelper.typeAndWait(TypedSearch);
  await autocompleteHelper.hoverResult(1);

  const selectElemPosition = await autocompleteHelper.getSelectedElementPos();
  expect(selectElemPosition).toEqual(0);

  const searchValue = await autocompleteHelper.getSearchInputValue();
  expect(searchValue.trim()).toEqual(TypedSearch);

  await autocompleteHelper.clickResult(1);
  const selectedSearchValue = await autocompleteHelper.getSearchInputValue();
  const expectedLabelName = mockAutocomplete.features[0].properties.geocoding.name;
  expect(selectedSearchValue).toEqual(expectedLabelName);
});

test('move to on click', async () => {
  await page.goto(APP_URL);
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/);
  const { center: map_position_before } = await getMapView(page);
  await autocompleteHelper.typeAndWait('Hello');
  await page.click('.autocomplete_suggestions li:nth-child(3)');
  const { center: map_position_after } = await getMapView(page);
  expect(map_position_before).not.toEqual(map_position_after);
  const [expectedLng, expectedLat] = mockAutocomplete.features[2].geometry.coordinates;
  expect(map_position_after).toEqual({ lat: expectedLat, lng: expectedLng });
});

test('center on select', async () => {
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete/);
  await page.goto(APP_URL);
  await autocompleteHelper.typeAndWait('Hello');
  await page.click('.autocomplete_suggestion:nth-child(1)');
  const { center, zoom } = await getMapView(page);
  expect(center).toEqual({ lat: 5, lng: 30 });
  expect(zoom).toEqual(16.5);

  // @TODO: this is supposed to test that the 'bbox' parameter is used, when present,
  // to fit the map bounds to the best view. But this test is broken because of
  // the absent bounds implementation in the MapBox-GL mock.
  // Restore it properly if we use the real MapBox-GL for testing in the future.
  // await page.keyboard.type('Hello');
  // await page.waitFor(100);
  // await page.waitForSelector('.autocomplete_suggestion');
  // await page.click('.autocomplete_suggestion:nth-child(2)');
  // const newCenter = await page.evaluate(() => {
  //   return window.MAP_MOCK.getCenter();
  // });
  // expect(newCenter).toEqual({ lat: 4, lng: 3 });
});

test('favorite search', async () => {
  await page.goto(APP_URL);
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/);
  await storePoi(page, { title: 'hello' });
  await autocompleteHelper.typeAndWait('Hello');
  expect(await exists(page, '.autocomplete_suggestion--favorite')).toBeTruthy();
});

test('suggestions should not reappear after fast submit', async () => {
  responseHandler.addPreparedResponse(mockAutocompleteAllTypes, /autocomplete\?q=paris/, {
    delay: 300,
  });
  await page.goto(APP_URL);
  await autocompleteHelper.typeAndSubmit('paris');
  await page.waitFor(600);
  await page.waitForSelector('.autocomplete_suggestions', { hidden: true });
});

test('check template', async () => {
  responseHandler.addPreparedResponse(mockAutocompleteAllTypes, /autocomplete\?q=type/);
  await page.goto(APP_URL);
  await autocompleteHelper.typeAndWait('type');

  const lines = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.autocomplete_suggestion')).map(rawSuggest => {
      return [
        rawSuggest.querySelector('.autocomplete_suggestion__first_line').innerText.trim(),
        rawSuggest.querySelector('.autocomplete_suggestion__second_line').innerText.trim(),
      ];
    });
  });
  /* street */
  expect(lines[0][0]).toEqualCaseInsensitive('037');
  expect(lines[0][1]).toEqualCaseInsensitive('Ferriere, Italia');

  /* house */
  expect(lines[1][0]).toEqualCaseInsensitive('37 Rue Robert');
  expect(lines[1][1]).toEqualCaseInsensitive('Nîmes, France');

  /* poi */
  expect(lines[2][0]).toEqualCaseInsensitive('maga');
  expect(lines[2][1]).toEqualCaseInsensitive('SNP 44/2, Handlová, Slovensko');

  /* admin */
  expect(lines[3][0]).toEqualCaseInsensitive('Le Cannet (06110)');
  expect(lines[3][1]).toEqualCaseInsensitive("Alpes-Maritimes, Provence-Alpes-Côte d'Azur, France");
});

test('Retrieve restaurant category when we search "restau"', async () => {
  const searchQuery = 'restau';

  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=restau/);

  await page.goto(APP_URL);
  await autocompleteHelper.typeAndWait(searchQuery);

  const [firstLine, suggestionId] = await page.evaluate(() => {
    return [
      document.querySelector(
        '.autocomplete_suggestion:first-child .autocomplete_suggestion__first_line'
      ).innerText,
      document.querySelector('.autocomplete_suggestion:first-child').getAttribute('data-id'),
    ];
  });

  expect(firstLine).toEqual('Restaurant');
  expect(suggestionId).toEqual('category:restaurant');
});

test('Retrieve no category when we search "barcelona", not even "bar"', async () => {
  const searchQuery = 'barcelona';

  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=barcelona/);

  await page.goto(APP_URL);
  await autocompleteHelper.typeAndWait(searchQuery);

  const firstLine = await page.evaluate(() => {
    return document.querySelector(
      '.autocomplete_suggestion:first-child .autocomplete_suggestion__first_line'
    ).innerText;
  });

  expect(firstLine).toEqual('test result 1');
});

afterEach(async () => {
  await clearStore(page);
  responseHandler.reset();
});

afterAll(async () => {
  await browser.close();
});
