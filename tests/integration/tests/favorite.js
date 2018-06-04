import puppeteer from 'puppeteer'
const config = require('../config')

import {wait} from '../tools'
const APP_URL = `http://localhost:${config.SERVER.PORT}`

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

test('toggle favorite', async () => {
  expect.assertions(2)
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

test('add favorite', async () => {
  expect.assertions(1)
  await page.goto(APP_URL)
  await page.waitForNavigation()
  page.evaluate(() => {
    fire('store_poi', {name : 'Poi name', getKey : () => {return 1}, store: () => {return {id: 1}}}) /* minimal poi */
  })
  await page.click('.side_bar__fav')
  await wait(100)
  let items = await  page.waitForSelector('.favorite_panel__item')
  expect(items).not.toBeNull()
})

test('add favorite', async () => {
  expect.assertions(2)
  await page.goto(APP_URL)
  await page.waitForNavigation()
  page.evaluate(() => {
    fire('store_poi', {name : 'Poi name', getKey : () => {return 1}, store: () => {return {id: 1}}}) /* minimal poi */
  })
  await page.click('.side_bar__fav')
  await wait(100)
  let items = await  page.waitForSelector('.favorite_panel__item')
  expect(items).not.toBeNull()

  /* remove it */
  let removeHandle = await  page.waitForSelector('.favorite_panel__remove')
  /* this will do the trick (click on a hidden element) */
  await page.evaluate(() => { document.querySelector('.favorite_panel__item__actions').style.display = 'block' })

  await removeHandle.click()
  await wait(500)
  await page.waitForSelector('.favorite_panel__container__empty')
  expect(items).not.toBeNull()
})

afterAll(() => {
  browser.close()
})

