import puppeteer from 'puppeteer'
import {wait} from './../tools'
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

test('click on a poi', async () => {
  expect.assertions(1)
  await page.goto(APP_URL)
  await page.evaluate(() => {
    window.MAP_MOCK.evented.prepare('click', 'poi-level-1',  {features : [{geometry : {coordinates : [0,0]}, properties :{ name : 'Poi test', id : 0}}]})
  })
  await page.click('#mock_poi')
  const poiPanel = await page.waitForSelector('.poi_panel__title ')
  expect(poiPanel).not.toBeFalsy()
})

afterAll(() => {
  browser.close()
})

