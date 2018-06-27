import puppeteer from 'puppeteer'
import {getText} from '../tools'
const configBuilder = require('nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`
let browser
let page

beforeAll(async () => {
  try {
    browser = await puppeteer.launch()
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
  await page.goto(APP_URL)
  await page.evaluate(() => {
    window.MAP_MOCK.evented.prepare('click', 'poi-level-1',  {features : [{geometry : {coordinates : [0,0]}, properties :{ name : 'Poi test', id : 0, subclass:'university'}}]})
  })
  await page.click('#mock_poi')
  const poiPanel = await page.waitForSelector('.poi_panel__title ')
  expect(poiPanel).not.toBeFalsy()

  const translatedSubClass = await getText(page, '.poi_panel__description')
  console.log(translatedSubClass)
  expect(translatedSubClass).toEqual('université')
})

afterAll(() => {
  browser.close()
})

