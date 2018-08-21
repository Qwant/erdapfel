import puppeteer from 'puppeteer'

export const wait = async function wait (t = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(t)
    }, t)
  })
}

export const getText = async function (page, selector) {
  return await page.evaluate(selector => {
    return document.querySelector(selector).textContent
  }, selector)
}

export const initBrowser = async function () {
  const browser = await puppeteer.launch({args: puppeteerArguments})
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'accept-language': 'fr_FR,fr,en;q=0.8' /* force fr header */
  })

  page.on('console', msg => {
    console.log(`> ${msg.text()}`)
  })
  return {browser, page}
}

export function store(page, soreKey,  data) {
  page.evaluate((favorite, key) => {
    localStorage.setItem(key, JSON.stringify(favorite))
  }, data, soreKey)
}