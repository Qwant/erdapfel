import {initBrowser, wait} from "../tools";
import ResponseHandler from "../helpers/response_handler";
const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`
const ROUTES_PATH = `routes`
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

  await page.focus('#itinerary_input_origin')

  let yourPositionItem = await page.waitForSelector('.itinerary_suggest_your_position', {visible : true})
  expect(yourPositionItem).not.toBeNull()
})

test('switch start end', async () => {
  expect.assertions(1)
  await showDirection(page)

  await page.type('#itinerary_input_origin', 'start')
  await page.type('#itinerary_input_destination', 'end')
  await page.click('.itinerary_invert_origin_destination')
  let inputValues = await page.evaluate(() => {
    return {startInput : document.querySelector('#itinerary_input_origin').value, endInput : document.querySelector('#itinerary_input_destination').value}
  })

  expect(inputValues).toEqual({startInput : 'end', endInput : 'start'})
})

test('simple search', async () => {
  expect.assertions(1)
  responseHandler.addPreparedResponse(mockAutocomplete, /autocomplete\?q=direction/)
  responseHandler.addPreparedResponse(mockMapBox, /\/30\.0000000,5\.0000000;30\.0000000,5\.0000000/)
  await showDirection(page)

  await page.type('#itinerary_input_origin', 'direction')
  await page.keyboard.press('Enter')
  await page.type('#itinerary_input_destination', 'direction')
  await page.keyboard.press('Enter')

  let leg0 = await page.waitForSelector('#itinerary_leg_0')

  expect(leg0).not.toBeNull()
})

test('route flag', async () => {
  expect.assertions(3)
  await page.goto(`${APP_URL}/${ROUTES_PATH}`)

  await page.waitForSelector('#itinerary_input_origin')
  let smallToolBar = await page.waitForSelector('.top_bar--small')

  expect(smallToolBar).not.toBeNull()
  let directionStartInput = await page.evaluate(() =>
     document.getElementById('itinerary_input_origin').value
  )
  expect(directionStartInput).toEqual('')
  let directionEndInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_destination').value
  )
  expect(directionEndInput).toEqual('')
})


test('destination', async () => {
  expect.assertions(3)
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?destination=latlon:47.4:7.5@Monoprix Nice`)

  await page.waitForSelector('#itinerary_input_origin')
  let smallToolBar = await page.waitForSelector('.top_bar--small')
  expect(smallToolBar).not.toBeNull()
  let directionStartInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_origin').value
  )
  expect(directionStartInput).toEqual('')

  let directionEndInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_destination').value
  )
  expect(directionEndInput).toEqual('Monoprix Nice')
})

test('origin & destination', async () => {
  expect.assertions(3)
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5@Monoprix Nice&destination=latlon:47.4:7.5@Franprix Cannes`)
  await page.waitForSelector('#itinerary_input_origin')
  let smallToolBar = await page.waitForSelector('.top_bar--small')

  expect(smallToolBar).not.toBeNull()
  let directionStartInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_origin').value
  )
  expect(directionStartInput).toEqual('Monoprix Nice')

  let directionEndInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_destination').value
  )
  expect(directionEndInput).toEqual('Franprix Cannes')
})

test('origin & destination & mode', async () => {
  expect.assertions(4)
  await page.goto(`${APP_URL}/${ROUTES_PATH}/?origin=latlon:47.4:7.5@Monoprix Nice&destination=latlon:47.4:7.5974115&mode=walking`)

  await page.waitForSelector('#itinerary_input_origin')
  let smallToolBar = await page.waitForSelector('.top_bar--small')
  expect(smallToolBar).not.toBeNull()
  let directionStartInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_origin').value
  )
  expect(directionStartInput).toEqual('Monoprix Nice')

  let directionEndInput = await page.evaluate(() =>
    document.getElementById('itinerary_input_destination').value
  )
  expect(directionEndInput).toEqual('47.40000 : 7.59741')

  let activeLabel = await page.evaluate(() => {
    return Array.from(document.querySelector('.label_active').classList).join(',')
  })
  expect(activeLabel).toContain('itinerary_button_label_walking')
})

const showDirection = async (page) => {
  await page.goto(APP_URL)
  await page.waitForSelector('.service_panel__item__direction')
  await page.click('.service_panel__item__direction')
}

test('select itinerary leg', async () => {
  expect.assertions(1)
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.0000000,6\.6000000/)
  await page.goto(`${APP_URL}/${ROUTES_PATH}/routes/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.0`)

  await page.waitForSelector('#itinerary_leg_0')

  page.click('#itinerary_leg_0')

  await wait(300)

  let featureState = await page.evaluate(() => {
    return MAP_MOCK.featureState
  })

  expect(featureState).toEqual({source: "source_0", id: 1})
})

test('select itinerary step', async () => {
  expect.assertions(1)
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.1000000,47\.4000000/)
  await page.goto(`${APP_URL}/${ROUTES_PATH}/routes/?origin=latlon:47.4:7.5&destination=latlon:47.4:6.1`)

  await page.waitForSelector('#itinerary_leg_0')

  await page.click('.itinerary_leg_via_details')
  await page.click('.itinerary_roadmap_step:nth-of-type(2)')

  let center = await page.evaluate(() => {
    return MAP_MOCK.getCenter()
  })

  expect(center).toEqual({"lat": 48.823566, "lng": 2.290454})
})


test('api error handling', async () => {
  expect.assertions(1)
  /* prepare "error" response */
  responseHandler.addPreparedResponse({}, /\/7\.5000000,47\.4000000;6\.6000000,6\.6000000/, {status : 422})
  await page.goto(`${APP_URL}/${ROUTES_PATH}/routes/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.6`)
  let errorMessageHandler = await page.waitForSelector('.itinerary_no-result')
  expect(errorMessageHandler).not.toBeNull()
})

test('api wait effect', async () => {
  expect.assertions(2)
  responseHandler.addPreparedResponse(mockMapBox, /\/7\.5000000,47\.4000000;6\.7000000,6\.6000000/)
  await page.goto(`${APP_URL}/${ROUTES_PATH}/routes/?origin=latlon:47.4:7.5&destination=latlon:6.6:6.7`)
  let errorMessageHandler = await page.waitForSelector('.itinerary_placeholder-box')
  expect(errorMessageHandler).not.toBeNull() // test wait panel
  let firstLeg = await page.waitForSelector('#itinerary_leg_0')
  expect(firstLeg).not.toBeNull() // test result
})

afterAll(async () => {
  await browser.close()
})