import puppeteer from 'puppeteer'
const APP_URL = 'http://localhost:3000'


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

test('toggle favorite',async () => {
  expect.assertions(2);
  await page.goto(APP_URL)
  try {
    let favPanelHidden = await page.waitForSelector(".favorites_panel--hidden")
    expect(favPanelHidden).not.toBeFalsy()
    await page.waitForNavigation()
    await page.click('.side_bar__fav')

    let favPanel = await page.waitForSelector('.favorites_panel--hidden', {hidden : true})

    expect(favPanel).not.toBeFalsy()
  } catch (error) {
    console.error(error)
  }
})

afterAll(() => {
  browser.close()
})
