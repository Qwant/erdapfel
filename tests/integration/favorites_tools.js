import { wait } from './tools';

/**
 * Prerequisite : Favorite Panel Must be open
 * @param page
 * @returns {Promise<[Favorite]>}
 */
export async function getFavorites(page) {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.favorite_panel__item__more_container')).map(e => {
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
  await wait(500);
}
