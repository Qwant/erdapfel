import {initBrowser, wait} from '../tools'
import AutocompleteCucumberise from "../cucumberise/autocomplete";
const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`

let browser
let page
let autocompleteHelper
const mockAutocomplete = require('../../__data__/autocomplete')

beforeAll(async () => {
  let browserPage = await initBrowser()
  page = browserPage.page
  browser = browserPage.browser
  autocompleteHelper = new AutocompleteCucumberise(page)
  await autocompleteHelper.prepareResponse()
})

test('search and clear', async () => {
  expect.assertions(4)
  autocompleteHelper.addPreparedResponse(mockAutocomplete, /autocomplete/)
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

test('keyboard navigation', async () => {
  const TypedSearch = 'Hello'
  autocompleteHelper.addPreparedResponse(mockAutocomplete, /autocomplete/)
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
  autocompleteHelper.addPreparedResponse(mockAutocomplete, /autocomplete/)
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
  console.log(selectedSearchValue)
})

test('move to on click', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  autocompleteHelper.addPreparedResponse(mockAutocomplete, /autocomplete/)
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
  autocompleteHelper.addPreparedResponse(mockAutocomplete, /autocomplete/)
  await page.goto(APP_URL)
  await page.keyboard.type('test')
  await wait(100)
  await page.waitForSelector('.autocomplete_suggestion')
  await page.click('.autocomplete_suggestion:nth-child(1)')
  let {center, zoom} = await page.evaluate(() => {
    return {center : window.MAP_MOCK.getCenter(), zoom : window.MAP_MOCK.getZoom()}
  })
  expect(center).toEqual({ lat: 5, lng: 30 })
  expect(zoom).toEqual(18)

  await page.keyboard.type('test')
  await wait(100)
  await page.waitForSelector('.autocomplete_suggestion')
  await page.click('.autocomplete_suggestion:nth-child(2)')
  center = await page.evaluate(() => {
    return window.MAP_MOCK.getCenter()
  })
  expect(center).toEqual({ lat: 1, lng: 4 })
})

afterAll(async () => {
  await browser.close()
})
