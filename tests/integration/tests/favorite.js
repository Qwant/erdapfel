const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`
import {initBrowser, wait, store, clearStore} from '../tools'

let browser
let page

beforeAll(async () => {
  let browserPage = await initBrowser()
  page = browserPage.page
  browser = browserPage.browser
})

test('toggle favorite', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  let favPanelHidden = await page.waitForSelector(".favorites_panel--hidden")
  expect(favPanelHidden).not.toBeFalsy()
  await page.click('.side_bar__fav')
  let favPanel = await page.waitForSelector('.favorites_panel--hidden', {hidden : true})
  expect(favPanel).not.toBeFalsy()
})

test('add favorite', async () => {
  expect.assertions(1)
  await page.goto(APP_URL)
  page.evaluate(() => {
    fire('store_poi', {name : 'Poi name', getKey : () => {return 1}, store: () => {return {id: 1}}}) /* minimal poi */
  })
  await page.click('.side_bar__fav')
  await wait(100)
  let items = await  page.waitForSelector('.favorite_panel__item')
  clearStore(page)
  expect(items).not.toBeNull()
})


test('restore favorite from localStorage', async () => {
  expect.assertions(1)
  await page.goto(APP_URL)
  const testTitle = 'demo_fav'
  store(page, 'demo_fav', {id : 0, name : testTitle})
  await wait(100)
  await page.click('.side_bar__fav')
  await page.waitForSelector('.favorite_panel__item__title')
  let title = await page.evaluate(() => {
    return document.querySelector('.favorite_panel__item__title').innerText
  })
  clearStore(page)
  expect(title).toEqual(testTitle)
})

test('remove favorite', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  await page.evaluate(() => {
    fire('store_poi', {name : 'Poi name', getKey : () => {return 1}, store: () => {return {id: 1}}}) /* minimal poi */
  })
  page.click('.side_bar__fav')
  await wait(200) /* wait for panel completely displayed  */
  let items = await page.waitForSelector('.favorite_panel__item')
  expect(items).not.toBeNull()
  /* remove it */
  await  page.waitForSelector('.favorite_panel__remove')
  /* this will do the trick (click on a hidden element) */
  await page.evaluate(() => { document.querySelector('.favorite_panel__item__actions').style.display = 'block' })
  page.click('.favorite_panel__remove')
  items = await page.waitForSelector('.favorite_panel__container__empty')
  expect(items).not.toBeNull()
})

afterAll(() => {
  browser.close()
})



