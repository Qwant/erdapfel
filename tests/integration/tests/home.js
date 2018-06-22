import puppeteer from 'puppeteer'
const configBuilder = require('nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`
let browser
let page

beforeAll(async () => {
  try {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']})
    page = await browser.newPage()
  } catch (error) {
    console.error(error)
  }
})

test('is dom loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  try {
    let sceneContent = await page.waitForSelector("#scene_container");
    expect(sceneContent).not.toBeFalsy()
  } catch (error) {
    console.log(error)
  }
})

test('is panels loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  try {
    let sceneContent = await page.waitForSelector(".error_panel");
    expect(sceneContent).not.toBeFalsy()
  } catch (error) {
    console.log(error)
  }
})

test('is map loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  let sceneContent = await page.waitForSelector(".mapboxgl-canvas");
  expect(sceneContent).not.toBeFalsy()
})

afterAll(() => {
  browser.close()
})
