import puppeteer from 'puppeteer'

const APP_URL = 'http://localhost:8080'
let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({})
  page = await browser.newPage();
})

afterAll(() => {
  browser.close()
})

test('is dom loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  let sceneContent = await page.waitForSelector("#scene_container");
  expect(sceneContent).not.toBeFalsy();
})

test('is panels loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  let sceneContent = await page.waitForSelector(".error_panel");
  expect(sceneContent).not.toBeFalsy();
})

test('is map loaded',async () => {
  expect.assertions(1);
  await page.goto(APP_URL)
  let sceneContent = await page.waitForSelector(".mapboxgl-canvas");
  expect(sceneContent).not.toBeFalsy();
})