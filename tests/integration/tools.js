/* globals puppeteerArguments */
import puppeteer from 'puppeteer';

export const getText = async function(page, selector) {
  return await page.evaluate(selector => {
    return document.querySelector(selector).textContent;
  }, selector);
};

export const initBrowser = async function() {
  const headless = process.env.headless !== 'false';


  const browser = await puppeteer.launch({ args: puppeteerArguments, headless });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'accept-language': 'fr_FR,fr,en;q=0.8', /* force fr header */
  });

  page.on('console', msg => {
    /* eslint-disable no-console */
    console.log(`> ${msg.text()}`);
  });
  return { browser, page };
};

export async function store(page, soreKey, data) {
  await page.evaluate((favorite, key) => {
    localStorage.setItem(key, JSON.stringify(favorite));
  }, data, soreKey);
}

export const clearStore = async function(page) {
  if (page.url() === 'about:blank') {
    return;
  }
  await page.evaluate(() =>
    localStorage.clear()
  );
};
