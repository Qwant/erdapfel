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

  page.screenshot({path : './tmp/test.png'})
  const clickPoiHandle = page.evaluateHandle(() => {
    return 'window.MAP_MOCK.selectPoi()'
  })
  await wait(300)
  await page.screenshot({path : './tmp/aa.png'})
  expect(clickPoiHandle).not.toBeFalsy()
})

afterAll(() => {
  browser.close()
})

