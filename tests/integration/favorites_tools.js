
// Returns all favorites as an array
// It needs the favorite panel to be open
export async function getFavorites(page) {
    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.favorite_panel__swipe_element')).map((e) => {
        return {
          title: e.querySelector('.favorite_panel__item__title').innerText,
          desc: e.querySelector('.favorite_panel__item__desc').innerText,
          icons: Array.from(e.querySelector('.favorite_panel__item__image.icon').classList.values())
        }
      })
    })
  }
  