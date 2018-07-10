import puppeteer from 'puppeteer'
import {wait} from '../tools'
const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`

let browser
let page
const mockAutocomplete = require('../../__mocks__/autocomplete')

beforeAll(async () => {
  try {
    browser = await puppeteer.launch({args: puppeteerArguments})
    page = await browser.newPage()
    await page.setRequestInterception(true)
    page.on('request', interceptedRequest => {
      if(interceptedRequest.url().match(/autocomplete/)) {
        interceptedRequest.headers['Access-Control-Allow-Origin'] = '*'
        interceptedRequest.respond({body : JSON.stringify(mockAutocomplete), headers  : interceptedRequest.headers})
      } else {
        interceptedRequest.continue()
      }
    })
    page.on('console', msg => {
      console.log(`> ${msg.text()}`)
    })
  } catch (error) {
    console.error(error)
  }
})

test('clear button',async () => {
  expect.assertions(3)
  await page.goto(APP_URL)
  await page.keyboard.type('Hello')
  let cleanHandle = await page.waitForSelector('#clear_button')
  expect(cleanHandle).not.toBeNull()

  let search_value = await page.evaluate(() => {
      return document.querySelector('#search').value
    })
  expect(search_value).toEqual('Hello');

  await page.click('#clear_button')
  let search_value_after_clear = await page.evaluate(() => {
      return document.querySelector('#search').value
    })
  expect(search_value_after_clear).toEqual('');

})

test('simple search', async () => {
  expect.assertions(1)
  await page.goto(APP_URL)
  await page.keyboard.type('test')
  await wait(100)
  const autocompleteItems = await page.waitForSelector('.autocomplete_suggestion')
  expect(autocompleteItems).not.toBeNull()
})

test('move to on click', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  let map_position_before = await page.evaluate(() => {
    return window.MAP_MOCK.center
  })
  await page.keyboard.type('Hello')
  const autocompleteItems = await page.waitForSelector('.autocomplete_suggestion')
  await page.click('body > div.autocomplete_suggestions > div:nth-child(3)')
  let map_position_after = await page.evaluate(() => {
    return window.MAP_MOCK.center
  })
  expect(map_position_before).not.toEqual(map_position_after);
  const [expectedLng, expectedLat] = mockAutocomplete['features'][2]['geometry']['coordinates']
  expect(map_position_after).toEqual({"lat": expectedLat, "lng": expectedLng}
);
})

afterAll(() => {
  browser.close()
})
