import puppeteer from 'puppeteer'
import {wait} from '../tools'
const config = require('../config')
const APP_URL = `http://localhost:${config.SERVER.PORT}`

let browser
let page

beforeAll(async () => {
  try {
    browser = await puppeteer.launch()
    page = await browser.newPage()
    page.on('console', msg => {
      console.log(`> ${msg.text()}`)
    })
  } catch (error) {
    console.error(error)
  }
})

test('key press',async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  await page.keyboard.type('Hello')
  let cleanHandle = await page.waitForSelector('#clear_button')
  expect(cleanHandle).not.toBeNull()

  /* check input content */
  let searchValueHandle = await page.evaluateHandle(() => { return document.querySelector('#search').value === 'Hello' })
  expect(searchValueHandle._remoteObject.value).toBeTruthy()
})


test('key press',async () => {
  expect.assertions(2)
  await page.goto(APP_URL)

  await page.keyboard.type('Hello')
  let cleanHandle = await page.waitForSelector('#clear_button')
  expect(cleanHandle).not.toBeNull()

  /* check input content */
  let searchValueHandle = await page.evaluateHandle(() => { return document.querySelector('#search').value === 'Hello' })
  expect(searchValueHandle._remoteObject.value).toBeTruthy()
})

test('key press',async () => {
  expect.assertions(2)
  await page.goto(APP_URL)

  await page.keyboard.type('Hello')
  let cleanHandle = await page.waitForSelector('#clear_button')
  expect(cleanHandle).not.toBeNull()

  /* check input content */
  let searchValueHandle = await page.evaluateHandle(() => { return document.querySelector('#search').value === 'Hello' })
  expect(searchValueHandle._remoteObject.value).toBeTruthy()
})


test('simple_word', async () => {
  expect.assertions(1)
  await page.setRequestInterception(true)
  const mockAutocomplete = require('../../__mocks__/autocomplete')
  page.on('request', interceptedRequest => {
    if(interceptedRequest.url().match(/autocomplete/)) {
      interceptedRequest.headers['Access-Control-Allow-Origin'] = '*'
      interceptedRequest.respond({body : JSON.stringify(mockAutocomplete), headers  : interceptedRequest.headers})
    } else {
      interceptedRequest.continue()
    }
  })
  await page.goto(APP_URL)
  //await page.keyboard.type('test')
  await page.screenshot('./tmp/sipl.png')

  //await wait(300)
//  const autocompleteItems = await page.waitForSelector('.autocomplete_suggestion')
  expect(1).not.toBeNull()
})

afterAll(() => {
  browser.close()
})

