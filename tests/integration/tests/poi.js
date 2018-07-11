import puppeteer from 'puppeteer'
import {getText} from '../tools'
const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`
let browser
let page

beforeAll(async () => {
  try {
    browser = await puppeteer.launch({args: global.puppeteerArguments})
    page = await browser.newPage()
    await page.setExtraHTTPHeaders({
      'accept-language': 'fr_FR,fr,en;q=0.8' /* force fr header */
    })
    page.on('console', msg => {
      console.log(`> ${msg.text()}`)
    })
  } catch (error) {
    console.error(error)
  }
})

test('click on a poi', async () => {
  expect.assertions(2)

  await page.setRequestInterception(true)
  const mockPoi = require('../../__mocks__/poi')
  page.on('request', interceptedRequest => {
    if(interceptedRequest.url().match(/poi/)) {
      interceptedRequest.headers['Access-Control-Allow-Origin'] = '*'
      interceptedRequest.respond({body : JSON.stringify(mockPoi), headers  : interceptedRequest.headers})
    } else {
      interceptedRequest.continue()
    }
  })

  await page.goto(APP_URL)
  await page.evaluate(() => {
    window.MAP_MOCK.evented.prepare('click', 'poi-level-1',  {originalEvent : {clientX : 1000},features : [{properties :{global_id : 1}}]})
  })
  await page.click('#mock_poi')
  const poiPanel = await page.waitForSelector('.poi_panel__title ')
  expect(poiPanel).not.toBeFalsy()

  const translatedSubClass = await getText(page, '.poi_panel__description')
  console.log(translatedSubClass)
  expect(translatedSubClass).toEqual('musée')
})

afterAll(() => {
  browser.close()
})
