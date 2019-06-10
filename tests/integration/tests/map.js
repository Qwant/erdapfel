import {initBrowser, store, clearStore} from "../tools";
const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`
let browser
let page

beforeAll(async () => {
  let browserPage = await initBrowser()
  page = browserPage.page
  browser = browserPage.browser
})

test('priority order with url & local-storage',async () => {
  let center = {lng:11.1, lat:43.3}

  expect.assertions(1)
  await page.goto(APP_URL)
  await store(page, 'qmaps_v1_last_location', {lng:19,lat:47,zoom:18})
  await page.goto(`${APP_URL}/#map=2.00/${center.lat}/${center.lng}`)
  await page.reload() // force reload

  let pageCenter = await page.evaluate(() => {
    return window.MAP_MOCK.center
  })
  expect(pageCenter).toEqual(center)
})

test('test local storage map center',async () => {
  let center = {lng:11.1, lat:43.3}

  expect.assertions(1)
  await page.goto(APP_URL)
  await store(page, 'qmaps_v1_last_location', center)
  await page.goto(APP_URL)
  await page.reload() // force reload

  let pageCenter = await page.evaluate(() => {
    return window.MAP_MOCK.center
  })
  expect(pageCenter).toEqual(center)
})

afterEach(async () => {
  await clearStore(page)
})

afterAll(async () => {
  await browser.close()
})
