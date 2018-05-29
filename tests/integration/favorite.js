import puppeteer from 'puppeteer'
import httpServerPwa from'http-server-pwa'

const APP_URL = 'http://localhost:8080'
let browser
let page
let server

beforeAll(async () => {
  try {
    server = await httpServerPwa(__dirname + '/../../public/', {p: 8080});
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

    expect(favPanel).not.toBeFalsy();
  } catch (error) {
    console.error(error)
  }
})

afterAll(() => {
  browser.close()
  server.close()
})


async function wait(ms = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(async()  => {
      resolve()
    }, ms)
  })

}