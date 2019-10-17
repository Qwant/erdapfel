const poiMock = require('../../__data__/poi.json');
const configBuilder = require('@qwant/nconf-builder');
const config = configBuilder.get();
const APP_URL = `http://localhost:${config.PORT}`;

import ResponseHandler from '../helpers/response_handler';
import { initBrowser, getText, wait, clearStore } from '../tools';
import { getFavorites, toggleFavoritePanel, storePoi } from '../favorites_tools';
import { languages } from '../../../config/constants.yml';

let browser;
let page;
let responseHandler;

beforeAll(async () => {
  browser = (await initBrowser()).browser;
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'accept-language': 'fr_FR,fr,en;q=0.8', /* force fr header */
  });
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();

  const autocompleteMock = require('../../__data__/autocomplete.json');
  responseHandler.addPreparedResponse(autocompleteMock, /autocomplete/);
  responseHandler.addPreparedResponse(poiMock, /places\/osm:way:63178753/);
});

test('click on a poi', async () => {
  expect.assertions(2);
  await page.goto(APP_URL);
  await selectPoiLevel(page, 1);
  const poiPanel = await page.waitForSelector('.poi_panel__title');
  expect(poiPanel).not.toBeFalsy();
  const translatedSubClass = await getText(page, '.poi_panel__description');
  expect(translatedSubClass).toEqual('musée');
});

test('load a poi from url', async () => {
  expect.assertions(2);
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  await page.waitForSelector('.poi_panel__title');
  const { title, address } = await page.evaluate(() => {
    return {
      title: document.querySelector('.poi_panel__title').innerText,
      address: document.querySelector('.poi_panel__address').innerText,
    };
  });
  expect(title).toMatch(/Musée d'Orsay/);
  expect(address).toMatch(/1 Rue de la Légion d'Honneur \(Paris\)/);
});

test('load a poi from url on mobile', async () => {
  await page.setViewport({
    width: 400,
    height: 800,
  });
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  await page.waitForSelector('.poi_panel__title');
  const { title, address, hours } = await page.evaluate(() => {
    return {
      title: document.querySelector('.poi_panel__content__card .poi_panel__title').innerText,
      address: document.querySelector('.poi_panel__content__card .poi_panel__address').innerText,
      hours: document
        .querySelector('.poi_panel__content__card .poi_panel__info__hours__status__text').innerText,
    };
  });
  expect(title).toMatch(/Musée d'Orsay/);
  expect(address).toMatch(/1 Rue de la Légion d'Honneur \(Paris\)/);
  expect(hours).toMatch(/Fermé/);
});

test('load a poi already in my favorite from url', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  await page.evaluate(storePoi, { id: 'osm:way:63178753' });
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  const plainStar = await page.waitForSelector('.icon-icon_star-filled');
  expect(plainStar).not.toBeFalsy();
});

test('update url after a poi click', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  await selectPoiLevel(page, 1);
  const location = await page.evaluate(() => {
    return document.location.href;
  });
  expect(location).toMatch(/@Mus%C3%A9e_dOrsay/);
});

test('update url after a favorite poi click', async () => {
  expect.assertions(1);
  await page.goto(APP_URL);
  await page.evaluate(storePoi, { id: poiMock.id, title: poiMock.name });
  await toggleFavoritePanel(page);
  await page.waitForSelector('.favorite_panel__item__title');
  await page.click('.favorite_panel__item__title');
  const location = await page.evaluate(() => {
    return document.location.href;
  });
  expect(location).toMatch(/@Mus%C3%A9e_dOrsay/);
});

test('open poi from autocomplete selection', async () => {
  expect.assertions(2);
  await page.goto(APP_URL);
  await page.keyboard.type('test');
  await page.waitForSelector('.autocomplete_suggestion');
  await page.click('.autocomplete_suggestion:nth-child(2)');
  await wait(300);
  const location = await page.evaluate(() => {
    return document.location;
  });

  // url is updated
  expect(location.href).toMatch(/osm:way:63178753@Mus%C3%A9e_dOrsay/);

  // poi panel is visible
  expect(await page.$('.poi_panel.poi_panel--hidden')).toBeFalsy();
});

test('center the map to the poi on a poi click', async () => {
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  await page.waitForSelector('.poi_panel__title');
  expect.assertions(1);
  await page.evaluate(() => {
    window.MAP_MOCK.flyTo({ center: { lat: 0, lng: 0 }, zoom: 10 });
  });
  await wait(300);
  await page.click('.poi_panel__content .poi_panel__description_container');
  const center = await page.evaluate(() => {
    return window.MAP_MOCK.getCenter();
  });
  expect(center).toEqual({
    lng: poiMock.geometry.coordinates[0],
    lat: poiMock.geometry.coordinates[1],
  });
});

test('display details about the poi on a poi click', async () => {
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/48.8605833/2.3261037`);
  await page.waitForSelector('.poi_panel__title');
  expect.assertions(8);

  await page.click('.poi_panel__content .poi_panel__description_container');
  let infoTitle = await page.evaluate(() => {
    return document.querySelector('.poi_panel__sub_block__title').innerText;
  });
  expect(infoTitle.trim()).toEqual('Accessible en fauteuil roulant.');
  await page.click('.poi_panel__block__collapse');

  await wait(300);
  infoTitle = await page.evaluate(() => {
    return document.querySelector('.poi_panel__sub_block__title').innerText;
  });
  expect(infoTitle.trim()).toEqual('Services & informations');

  const { contact, contactUrl, hours, phone, website } = await page.evaluate(() => {
    return {
      contact: document.querySelector('.poi_panel__info__contact').innerText,
      contactUrl: document.querySelector('.poi_panel__info__contact').href,
      hours: document.querySelector('.poi_panel__info__hours__status').innerText,
      phone: document.querySelector('.poi_phone_container_revealed').innerText,
      website: document.querySelector('.poi_panel__info__link').innerText,
    };
  });
  expect(hours.trim()).toMatch('Fermé');
  expect(phone).toMatch('01 40 49 48 14');
  expect(website).toMatch('WWW.MUSEE-ORSAY.FR');
  expect(contactUrl).toMatch('mailto:admin@orsay.fr');
  expect(contact).toMatch('ADMIN@ORSAY.FR');

  const wiki_block = await page.waitForSelector('.poi_panel__info__wiki');
  expect(wiki_block).not.toBeFalsy();
});

test('Poi name i18n', async () => {
  expect.assertions(2);

  await page.goto(`${APP_URL}/place/osm:way:453203@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  await page.waitForSelector('.poi_panel__title');

  const title = await getTitle(page);
  expect(title.main).toMatch('Musée d\'Orsay');
  expect(title.alternative).toMatch('Orsay museum');
});


test('Test 24/7', async () => {
  expect.assertions(1);

  const poi = { ...poiMock };
  poi.blocks.forEach(block => {
    if (block.type === 'opening_hours') {
      block.is_24_7 = true;
      block.seconds_before_next_transition = null;
      block.next_transition_datetime = null;
    }
  });
  poi.id = 'osm:way:24_7';

  responseHandler.addPreparedResponse(poi, /pois\/24_7/);

  await page.goto(APP_URL);
  await selectPoiLevel(page, 1);
  await page.waitForSelector('.poi_panel__title');

  const hours = await page.evaluate(() => {
    return document.querySelector('.poi_panel__info__hours__24_7').innerText.trim();
  });

  expect(hours).toEqual('Ouvert 24h/24 et 7j/7');
});

test('check pre-loaded Poi error handling', async () => {

  expect.assertions(1);

  await page.goto(`${APP_URL}/place/osm:way:2403`);
  const pathname = await page.evaluate(() => {
    return location.pathname;
  });
  expect(pathname).toEqual('/');
});

async function selectPoiLevel(page, level) {
  const mapPoiMock = {
    properties: {
      global_id: poiMock.id,
      name: poiMock.name,
    },
    geometry: poiMock.geometry,
  };
  await page.evaluate((level, poi) => {
    window.MAP_MOCK.evented.prepare(
      'click',
      `poi-level-${level}`,
      {
        originalEvent: { clientX: 1000 },
        features: [ poi ],
      },
    );
  }, level, mapPoiMock);
  const mockPoiBounds = await page.$('#mock_poi').then(e => e.boundingBox());
  // Click on the top-left corner
  await page.mouse.click(mockPoiBounds.x, mockPoiBounds.y);
  await wait(300);
}

test('add a poi as favorite and find it back in the favorite menu', async () => {
  await page.goto(APP_URL);

  // we select a poi and 'star' it
  await selectPoiLevel(page, 1);
  let poiPanel = await page.waitForSelector('.poi_panel__title');
  expect(poiPanel).not.toBeFalsy();
  await page.click('.poi_panel__actions .poi_panel__actions__icon__store');
  await page.click('.poi_panel__header .poi_panel__close');
  // we check that the first favorite item is our poi
  await toggleFavoritePanel(page);
  let fav = await getFavorites(page);
  expect(fav).toHaveLength(1);
  expect(fav[0].title).toEqual('Musée d\'Orsay');
  expect(fav[0].desc).toEqual('Musée');
  expect(fav[0].icons).toContainEqual('icon-museum');

  // we then reopen the poi panel and 'unstar' the poi.
  await page.click('.favorite_panel__item');
  poiPanel = await page.waitForSelector('.poi_panel__title');
  expect(poiPanel).not.toBeFalsy();

  await page.click('.poi_panel__actions .poi_panel__actions__icon__store');
  await page.click('.poi_panel__header .poi_panel__close');
  // it should disappear from the favorites
  await toggleFavoritePanel(page);
  fav = await getFavorites(page);
  expect(fav).toEqual([]);
});


describe('Poi hour i18n', () => {
  languages.supportedLanguages.forEach(language => {
    test(`Poi hour i18n [${language.locale}]`, async () => {
      const langPage = await browser.newPage();
      await langPage.setExtraHTTPHeaders({
        'accept-language': `${language.locale},${language.code},en;q=0.8`,
      });
      await langPage.goto(
        `${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`
      );
      await langPage.waitForSelector('.poi_panel__info__hours__table');
      const hourData = await getHours(langPage);
      if (language.code === 'fr') {
        expect(hourData[1][1]).toEqual('09h30 - 18h00');
      } else if (language.code === 'en') {
        expect(hourData[1][1]).toEqual('09:30 AM - 06:00 PM');
      } else {
        expect(hourData[1][1]).toEqual('09:30 - 18:00');
      }
    });
  });
});

afterEach(async () => {
  try {
    await clearStore(page); /* if only the above test is run page is not used */
  } catch (e) {
    console.error(e);
  }
});

afterAll(async () => {
  await browser.close();
});

async function getTitle(page) {
  return await page.evaluate(() => {
    let main = document.querySelector('.poi_panel__title__main');
    if (main) {
      main = main.innerText.trim();
    }
    let alternative = document.querySelector('.poi_panel__title__alternative');
    if (alternative) {
      alternative = alternative.innerText.trim();
    }
    return { main, alternative };
  });
}


async function getHours(page) {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.poi_panel__info__hours__table tr')).map(line => {
      return Array.from(line.querySelectorAll('td')).map(cell => {
        return cell.innerText.trim();
      });
    });
  });
}
