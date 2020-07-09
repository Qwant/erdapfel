import Poi from 'src/adapters/poi/poi';
import { getKey } from 'src/libs/pois';
import { exists, waitForAnimationEnd } from './tools';

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
  await page.waitForSelector('.menu__button');
  await page.click('.menu__button');
  expect(await exists(page, '.menu__panel')).toBeTruthy();
  await waitForAnimationEnd(page, '.menu__panel');
  await page.click('.menu__panel__action:nth-child(3)');
  await page.waitForSelector('.favorite_panel', { visible: true });
}

export async function storePoi(
  page,
  { id = 'A', title = 'poi', coords = { lat: 43, lng: 2 } } = {}
) {
  const poi = new Poi(id, title, 'poi', coords, '', '');
  await page.evaluate((storageKey, serializedPoi) => {
    window.localStorage.setItem(storageKey, serializedPoi);
  }, getKey(poi), JSON.stringify(poi));
}
