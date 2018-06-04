import puppeteer from 'puppeteer'
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
  expect.assertions(2);
  await page.goto(APP_URL)
  await page.waitForNavigation()

  await page.keyboard.type('Hello')
  let cleanHandle = await page.waitForSelector('#clear_button')
  expect(cleanHandle).not.toBeNull()

  /* check input content */
  let searchValueHandle = await page.evaluateHandle(() => { return document.querySelector('#search').value === 'Hello' })
  expect(searchValueHandle._remoteObject.value).toBeTruthy()
})



afterAll(() => {
  browser.close()
})
