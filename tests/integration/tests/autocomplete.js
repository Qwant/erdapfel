import {clearStore, initBrowser, wait} from '../tools'
import AutocompleteHelper from "../helpers/autocomplete";
import ResponseHandler from "../helpers/response_handler";
const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`

let browser
let page
let autocompleteHelper
let responseHandler
const mockAutocomplete = require('../../__data__/autocomplete')
const mockAutocompleteAllTypes = require('../../__data__/autocomplete_type')

beforeAll(async () => {
  let browserPage = await initBrowser()
  page = browserPage.page
  browser = browserPage.browser
  responseHandler = await ResponseHandler.init(page)
  autocompleteHelper = new AutocompleteHelper(page)
})

test('search and clear', async () => {
  expect.assertions(4)
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/)
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Helloa/)
  await page.goto(APP_URL)
  await autocompleteHelper.typeAndWait('Hello')
  let cleanHandle = await autocompleteHelper.getClearFieldButton()
  expect(cleanHandle).not.toBeNull()

  const autocompleteItems = await autocompleteHelper.getSuggestList()
  expect(autocompleteItems.length).toEqual(10)


  let searchValue = await autocompleteHelper.getSearchInputValue()
  expect(searchValue).toEqual('Hello')

  await autocompleteHelper.clearField()
  let searchValueAfterClear = await autocompleteHelper.getSearchInputValue()
  expect(searchValueAfterClear).toEqual('')
})

test('search has lang in query', async () => {
  const langPage = await browser.newPage()
  await langPage.setDefaultTimeout(2000) // to raise Puppeteer timeout early on fail
  await langPage.setExtraHTTPHeaders({
    'accept-language': 'de,en;q=0.8'
  })
  const responseHandler = await ResponseHandler.init(langPage)
  const autocompleteHelper = new AutocompleteHelper(langPage)

  const query = 'Frankreich'
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Frankreich&lang=de/)

  await langPage.goto(APP_URL)
  await autocompleteHelper.typeAndWait(query)
  const autocompleteItems = await autocompleteHelper.getSuggestList()
  expect(autocompleteItems).toHaveLength(10)
})

test('keyboard navigation', async () => {
  const TypedSearch = 'Hello'
  responseHandler.addPreparedResponse(mockAutocomplete, /Hello/)
  responseHandler.addPreparedResponse(mockAutocomplete, /square/)
  await page.goto(APP_URL)
  await autocompleteHelper.typeAndWait(TypedSearch)
  await wait(100)

  await autocompleteHelper.pressDown()
  await autocompleteHelper.pressDown()

  let selectElemPosition = await autocompleteHelper.getSelectedElementPos()

  /* second item is selected */
  expect(selectElemPosition).toEqual(1)

  /* search value is the second item label */
  const searchValue = await autocompleteHelper.getSearchInputValue()
  let expectedLabelName = mockAutocomplete.features[1].properties.geocoding.name

  expect(searchValue.trim()).toEqual(expectedLabelName)

  /* got to last item */
  for(let i = 0; i < mockAutocomplete.features.length - 2; i++) {
    await autocompleteHelper.pressDown()
  }
 /* one step more */
  await autocompleteHelper.pressDown()

  selectElemPosition = await autocompleteHelper.getSelectedElementPos()

  /* nothing is selected */
  expect(selectElemPosition).toEqual(-1)

  /* search value is reset to typed word */
  const originalSearchValue = await autocompleteHelper.getSearchInputValue()
  expect(originalSearchValue.trim()).toEqual(TypedSearch)

  await autocompleteHelper.pressDown()
  /* fist element is selected */
  selectElemPosition = await autocompleteHelper.getSelectedElementPos()
  expect(selectElemPosition).toEqual(0)

  /* type another char */
  await autocompleteHelper.typeAndWait('a')
  await wait(300)
  selectElemPosition = await autocompleteHelper.getSelectedElementPos()
  expect(selectElemPosition).toEqual(-1)
})

test('mouse navigation', async() => {
  const TypedSearch = 'Hello'
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/)
  await page.goto(APP_URL)
  await autocompleteHelper.typeAndWait(TypedSearch)
  await wait(100)

  await autocompleteHelper.hoverResult(1)

  let selectElemPosition = await autocompleteHelper.getSelectedElementPos()
  expect(selectElemPosition).toEqual(0)

  const searchValue = await autocompleteHelper.getSearchInputValue()
  expect(searchValue.trim()).toEqual(TypedSearch)

  await autocompleteHelper.clickResult(1)
  const selectedSearchValue = await autocompleteHelper.getSearchInputValue()
  let expectedLabelName = mockAutocomplete.features[0].properties.geocoding.name
  expect(selectedSearchValue).toEqual(expectedLabelName)
})

test('move to on click', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/)
  let map_position_before = await page.evaluate(() => {
    return window.MAP_MOCK.center
  })
  await page.keyboard.type('Hello')
  await page.waitForSelector('.autocomplete_suggestion')
  await page.click('.autocomplete_suggestion:nth-child(3)')
  let map_position_after = await page.evaluate(() => {
    return window.MAP_MOCK.center
  })
  expect(map_position_before).not.toEqual(map_position_after);
  const [expectedLng, expectedLat] = mockAutocomplete.features[2].geometry.coordinates
  expect(map_position_after).toEqual({lat: expectedLat, lng: expectedLng})
});

test('bbox & center', async () => {
  expect.assertions(3)
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/)
  await page.goto(APP_URL)
  await page.keyboard.type('Hello')
  await wait(100)
  await page.waitForSelector('.autocomplete_suggestion')
  await page.click('.autocomplete_suggestion:nth-child(1)')
  let {center, zoom} = await page.evaluate(() => {
    return {center : window.MAP_MOCK.getCenter(), zoom : window.MAP_MOCK.getZoom()}
  })
  expect(center).toEqual({ lat: 5, lng: 30 })
  expect(zoom).toEqual(18)

  await page.keyboard.type('Hello')
  await wait(100)
  await page.waitForSelector('.autocomplete_suggestion')
  await page.click('.autocomplete_suggestion:nth-child(2)')
  center = await page.evaluate(() => {
    return window.MAP_MOCK.getCenter()
  })
  expect(center).toEqual({ lat: 1, lng: 4 })
})

test('favorite search', async () => {
  expect.assertions(1)
  await page.goto(APP_URL)
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/)

  await page.evaluate(() => {
    fire('store_poi', new Poi(1, 'hello', 'second line', 'poi', {lat : 43, lng : 2}, '', '', []));
  })

  await page.keyboard.type('Hello')
  let favTitle = await page.waitForSelector('.autocomplete_suggestion__category_title')
  expect(favTitle).not.toBeNull()
})


// http://idunn_test.test/v1/pois/osm:node:4872758213?lang=fr
test('submit key', async () =>  {
  expect.assertions(2)
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=Hello/)
  await page.goto(APP_URL)
  /* submit with data already loaded */
  await page.keyboard.type('Hello')
  await wait(150)
  await page.keyboard.press('Enter')
  await wait(30)

  let center = await page.evaluate(() => {
    return MAP_MOCK.getCenter()
  })

  let firstFeatureCenter = mockAutocomplete.features[0].geometry.coordinates
  expect(center).toEqual({lat : firstFeatureCenter[1], lng : firstFeatureCenter[0]})
  await page.click('#clear_button')

  /* force specific query */
  responseHandler.addPreparedResponse(mockAutocompleteAllTypes, /autocomplete\?q=paris/)
  await page.keyboard.type('paris')
  await page.keyboard.press('Enter')

  await wait(150)

  center = await page.evaluate(() =>
    MAP_MOCK.getCenter()
  )

  firstFeatureCenter = mockAutocompleteAllTypes.features[0].geometry.coordinates
  expect(center).toEqual({lat : firstFeatureCenter[1], lng : firstFeatureCenter[0]})
})

test('check template', async () => {
  expect.assertions(8)
  responseHandler.addPreparedResponse(mockAutocompleteAllTypes, /autocomplete\?q=type/)
  await page.goto(APP_URL)
  await page.keyboard.type('type')
  await wait(100)
  await page.waitForSelector('.autocomplete_suggestion')

  let lines = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.autocomplete_suggestion')).map((rawSuggest) => {
      return [rawSuggest.querySelector('.autocomplete_suggestion__first_line').innerText.trim(), rawSuggest.querySelector('.autocomplete_suggestion__second_line').innerText.trim()]
    })
  })
  /* street */
  let stretAddress = ['0000', 'Ferriere', 'Italia'].filter((zone) => zone).join(', ')
  expect(lines[0][0]).toEqual(mockAutocompleteAllTypes.features[0].properties.geocoding.name)
  expect(lines[0][1]).toEqual(stretAddress)

  /* house */
  let houseAddress = ['30000', 'Nîmes', 'France'].filter((zone) => zone).join(', ')
  expect(lines[1][0]).toEqual(mockAutocompleteAllTypes.features[1].properties.geocoding.name)
  expect(lines[1][1]).toEqual(houseAddress)

   /* poi */
   expect(lines[2][0]).toEqual(mockAutocompleteAllTypes.features[2].properties.geocoding.name)
   expect(lines[2][1]).toEqual(mockAutocompleteAllTypes.features[2].properties.geocoding.address.label)

   /* admin */
   let labelFragments = mockAutocompleteAllTypes.features[3].properties.geocoding.label.split(',')
   expect(lines[3][0]).toEqual(labelFragments[0])
   expect(lines[3][1]).toEqual(labelFragments.slice(1).join(',').trim())
})

afterEach(async () => {
  await clearStore(page)
})

afterAll(async () => {
  await browser.close()
})
