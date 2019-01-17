import {initBrowser, clearStore} from "../tools";
import ResponseHandler from "../helpers/response_handler";
const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`
const mockAutocomplete = require('../../__data__/autocomplete')
const mockMapBox = require('../../__data__/mapbox')

let browser
let page
let responseHandler
beforeAll(async () => {
  let browserPage = await initBrowser()
  page = browserPage.page
  browser = browserPage.browser
  responseHandler = new ResponseHandler(page)
  await responseHandler.prepareResponse()
})

test('check "My position" label',async () => {
  expect.assertions(1)
  await showDirection(page)

  // wait for autocomplete library starting-up
  await page.waitForSelector('.itinerary_suggest_your_position')

  await page.focus('#itinerary_input_start')

  let yourPositionItem = await page.waitForSelector('.itinerary_suggest_your_position', {visible : true})
  expect(yourPositionItem).not.toBeNull()
})

test('switch start end', async () => {
  expect.assertions(1)
  await showDirection(page)

  await page.type('#itinerary_input_start', 'start')
  await page.type('#itinerary_input_end', 'end')

  await page.click('.itinerary_invert_start_end')
  let inputValue = await page.evaluate(() => {
    return {startInput : document.querySelector('#itinerary_input_start').value, endInput : document.querySelector('#itinerary_input_end').value}
  })

  expect(inputValue).toEqual({startInput : 'end', endInput : 'start'})
})

test('simple search', async () => {
  expect.assertions(1)
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=test/)
  responseHandler.addPreparedResponse(mockMapBox, /api.mapbox.com/)
  await showDirection(page)

  await page.type('#itinerary_input_start', 'test')
  await page.keyboard.press('Enter')
  await page.type('#itinerary_input_end', 'test')

  await page.keyboard.press('Enter')

  let leg0 = await page.waitForSelector('#itinerary_leg_0')

  expect(leg0).not.toBeNull()
})



afterEach(async () => {
  await clearStore(page)
})

afterAll(async () => {
  //await browser.close()
})


const showDirection = async (page) => {
  await page.goto(APP_URL)
  await page.waitForSelector('.service_panel__item__direction')
  await page.click('.service_panel__item__direction')
}