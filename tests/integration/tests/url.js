import {initBrowser} from '../tools'
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

test('url with poi', async () => {  expect.assertions(2)
  expect.assertions(1)
  await page.goto(`${APP_URL}`)



})

afterAll(() => {
  browser.close()
})

