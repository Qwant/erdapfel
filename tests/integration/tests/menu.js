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

beforeAll(async () => {
  let browserPage = await initBrowser()
  page = browserPage.page
  browser = browserPage.browser
  responseHandler = new ResponseHandler(page)
  autocompleteHelper = new AutocompleteHelper(page)
  await responseHandler.prepareResponse()
})


test('test menu template', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  page.waitForSelector('.menu__button')

  let panelPosition = await page.evaluate(() => {
    return window.innerWidth - document.querySelector('.menu__panel').offsetLeft
  })

  expect(panelPosition).toEqual(0)

  await page.click('.menu__button')
  await wait(600)

  panelPosition = await page.evaluate(() => {
    return window.innerWidth - document.querySelector('.menu__panel').offsetLeft
  })

  await page.click('.menu__panel__top__close')
  await wait(600)
  expect(panelPosition).toEqual(460)
})

test('menu open favorite', async () => {
  await page.goto(APP_URL)
  expect.assertions(2)
  await page.goto(APP_URL)
  page.waitForSelector('.menu__button')

  page.click('.menu__button')
  await wait(600)

  page.click('.menu__panel__action:nth-child(1)')
  let itinerary = await page.waitForSelector('.itinerary_container--active')
  expect(itinerary).not.toBeNull()
  await wait(600)
  page.click('.menu__button')
  await wait(600)
  page.click('.menu__panel__action:nth-child(2)')
  await wait(600)
  let favorites = await page.waitForSelector('.favorite_poi_panel__container')
  expect(favorites).not.toBeNull()
})

test('one panel open at a time', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  let servicePanelOpen = await page.waitForSelector('.service_panel--active')
  expect(servicePanelOpen).not.toBeFalsy()

  await page.click('.service_panel__item__direction')
  let servicePanelClose = await page.waitForSelector('.service_panel', {visible : false})
  expect(servicePanelClose).not.toBeFalsy()
})

test('service panel open on load', async () => {
  expect.assertions(1)
  await page.goto(`${APP_URL}/routes`)
  let servicePanelOpen = await page.waitForSelector('.service_panel')
  expect(servicePanelOpen).not.toBeFalsy()
})

afterEach(async () => {
  await clearStore(page)
})

afterAll(async () => {
  await browser.close()
})
