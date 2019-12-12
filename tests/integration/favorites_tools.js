import Poi from 'src/adapters/poi/poi';
import { getKey } from 'src/libs/pois';

/**
 * Prerequisite : Favorite Panel Must be open
 * @param page
 * @returns {Promise<[Favorite]>}
 */
export async function getFavorites(page) {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.favorite_panel__item')).map(e => {
      return {
        title: e.querySelector('.favorite_panel__item__title').innerText,
        desc: e.querySelector('.favorite_panel__item__desc').innerText,
        icons: Array.from(e.querySelector('.favorite_panel__item__image.icon').classList.values()),
      };
    });
  });
}

/**
 *
 * @param page
 * @returns {Promise<>}
 * open favorite panel
 * promise is resolved after animation
 */
export async function toggleFavoritePanel(page) {
  await page.click('.service_panel__item__fav');
  await page.waitForSelector('.favorite_panel', { visible: true, timeOut: 300 });
}

export async function storePoi(page, { id = 1, title = 'poi', coords = { lat: 43, lng: 2 } } = {}) {
  const poi = new Poi(id, title, 'second line', 'poi', coords, '', '');
  await page.evaluate((storageKey, serializedPoi) => {
    window.localStorage.setItem(storageKey, serializedPoi);
  }, getKey(poi), JSON.stringify(poi.serialize()));
}
