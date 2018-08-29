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

test('toggle favorite panel', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  let favPanelHidden = await page.waitForSelector(".favorites_panel--hidden")
  expect(favPanelHidden).not.toBeFalsy()
  await page.click('.side_bar__fav')
  let favPanel = await page.waitForSelector('.favorites_panel--hidden', {hidden : true})
  expect(favPanel).not.toBeFalsy()
})

test('favorite added is present in favorite panel', async () => {
  expect.assertions(1)
  await page.goto(APP_URL)
  page.evaluate(() => {
    fire('store_poi', new Poi(1, 'some poi', '', {lat : 43, lng : 2}, '', '', []))
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

test('remove favorite using favorite panel', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  await page.evaluate(() => {
    fire('store_poi', new Poi(1, 'some poi i will remove', '', {lat : 43, lng : 2}, '', '', []))
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

test('center map after a favorite poi click', async () => {
  await page.goto(APP_URL)
  await page.evaluate(() => {
    MAP_MOCK.flyTo({center : {lat : 10, lng : 0}, zoom : 10})
  })
  const favorite_mock_coordinates = {lat: 43.5, lng: 7.18}
  await page.evaluate((favorite_mock_coordinates_) => {
    fire('store_poi', new Poi(1, 'some poi i will click', '', favorite_mock_coordinates_, '', '', []))
  },favorite_mock_coordinates)

  await page.waitForSelector('.icon-icon_star')
  await page.click('.icon-icon_star')
  await wait(300)
  await page.waitForSelector('.favorite_panel__swipe_element')
  await page.click('.favorite_panel__swipe_element')
  let center = await page.evaluate(() => {
    return MAP_MOCK.getCenter()
  })
  expect(center).toEqual({lng  : favorite_mock_coordinates.lng, lat : favorite_mock_coordinates.lat})
  clearStore(page)
})


afterAll(() => {
  browser.close()
})
