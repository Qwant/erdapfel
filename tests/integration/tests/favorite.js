import puppeteer from 'puppeteer'
const configBuilder = require('@qwant/nconf-builder')
const config = configBuilder.get()
const APP_URL = `http://localhost:${config.PORT}`
import {wait} from '../tools'

let browser
let page

beforeAll(async () => {
  try {
    browser = await puppeteer.launch({args: puppeteerArguments})
    page = await browser.newPage()
    page.on('console', msg => {
      console.log(`> ${msg.text()}`)
    })
  } catch (error) {
    console.error(error)
  }
})

test('toggle favorite', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  try {
    let favPanelHidden = await page.waitForSelector(".favorites_panel--hidden")
    expect(favPanelHidden).not.toBeFalsy()
    await page.click('.side_bar__fav')
    let favPanel = await page.waitForSelector('.favorites_panel--hidden', {hidden : true})
    expect(favPanel).not.toBeFalsy()
  } catch (error) {
    console.error(error)
  }
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
  expect(items).not.toBeNull()
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
