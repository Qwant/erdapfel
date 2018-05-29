import puppeteer from 'puppeteer'
import httpServerPwa from'http-server-pwa'

const APP_URL = 'http://localhost:8080'
let browser
let page
let server

beforeAll(async () => {
  try {
    server = await httpServerPwa(__dirname + '/../../public/', {p: 8080});
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']})
    page = await browser.newPage();
  } catch (error) {
    console.error(error)
  }
})

test('is dom loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  try {
    let sceneContent = await page.waitForSelector("#scene_container");
    expect(sceneContent).not.toBeFalsy();
  } catch (error) {
    console.log(error)
  }
})

test('is panels loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  try {
    let sceneContent = await page.waitForSelector(".error_panel");
    expect(sceneContent).not.toBeFalsy();
  } catch (error) {
    console.log(error)
  }
})

test('is map loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  let sceneContent = await page.waitForSelector(".mapboxgl-canvas");
  expect(sceneContent).not.toBeFalsy();
})

afterAll(() => {
  browser.close()
  server.close()
})
