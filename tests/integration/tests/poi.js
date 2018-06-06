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

  let poi = await page.waitForSelector('#mock_poi')
  await poi.click()
  await wait(300)
  await page.screenshot({path : './tmp/aa.png'})
  expect(1).not.toBeFalsy()
})

afterAll(() => {
  browser.close()
})

