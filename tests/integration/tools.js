/* globals puppeteerArguments */
import puppeteer from 'puppeteer';
import LatLngPoi from 'src/adapters/poi/latlon_poi';

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

export async function simulateClickOnMap(page, latLng) {
  return await page.evaluate(poi => {
    // this is a copy of 'fire' from customEvents.js
    function fireEvent(name, ...params) {
      const event = document.createEvent('CustomEvent');
      event.initCustomEvent(name, false, false, { params });
      document.dispatchEvent(event);
    }

    return fireEvent('set_direction_point', poi);
  }, new LatLngPoi(latLng));
}

export async function getInputValue(page, selector) {
  return await page.evaluate(s => document.querySelector(s)?.value, selector);
}

export async function getMapView(page) {
  return await page.evaluate(() => ({
    center: window.MAP_MOCK.getCenter(),
    zoom: window.MAP_MOCK.getZoom(),
  }));
}

export async function exists(page, selector) {
  try {
    const result = await page.waitForSelector(selector);
    return !!result;
  } catch {
    return false;
  }
}

export async function isHidden(page, selector) {
  try {
    const result = await page.waitForSelector(selector, { hidden: true });
    return result === null;
  } catch {
    return false;
  }
}

export async function waitForAnimationEnd(page, selector) {
  await page.evaluate(elementSelector => new Promise(resolve => {
    const transition = document.querySelector(elementSelector);
    function onEnd() {
      transition.removeEventListener('animationend', onEnd);
      resolve();
    }
    transition.addEventListener('animationend', onEnd, false);
  }), selector);
}
