const poiMock = require('../../__data__/poi.json');

import ResponseHandler from '../helpers/response_handler';
import { initBrowser, getText, clearStore, getInputValue, exists } from '../tools';
import { toggleFavoritePanel, storePoi } from '../favorites_tools';
import { languages } from '../../../config/constants.yml';

let browser;
let page;
let responseHandler;

beforeAll(async () => {
  browser = (await initBrowser()).browser;
});

beforeEach(async () => {
  page = await browser.newPage();
  page.setDefaultTimeout(3000);
  await page.setExtraHTTPHeaders({
    'accept-language': 'fr_FR,fr,en;q=0.8', /* force fr header */
  });
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();

  const autocompleteMock = require('../../__data__/autocomplete.json');
  responseHandler.addPreparedResponse(autocompleteMock, /autocomplete/);
  responseHandler.addPreparedResponse(poiMock, /places\/osm:way:63178753(\?[^?]*)?$/);
});

test('click on a poi', async () => {
  await page.goto(APP_URL);
  await clickPoi(page);
  expect(await exists(page, '.poiItem')).toBeTruthy();
  const translatedSubClass = await getText(page, '.poiItem-subclass');
  expect(translatedSubClass).toEqual('Musée');
});

test('load a poi from url', async () => {
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  await page.waitForSelector('.poiTitle');
  const title = await page.evaluate(() => document.querySelector('.poiTitle').innerText);
  expect(title).toMatch(/Musée d'Orsay/);
});

test('load a poi from url and click on directions', async () => {
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  await page.waitForSelector('.poiTitle');
  await page.click('.poi_panel__actions .poi_panel__action__direction'); // Click on directions button
  await page.waitForSelector('#direction-input_destination');
  const destinationValue = await getInputValue(page, '#direction-input_destination');
  expect(destinationValue).toEqual("Musée d'Orsay");
});

test('load a poi from url with simple id', async () => {
  await page.goto(`${APP_URL}/place/osm:way:63178753?client=example`);
  await page.waitForSelector('.poiTitle');
  const title = await page.evaluate(() => document.querySelector('.poiTitle').innerText);
  expect(title).toMatch(/Musée d'Orsay/);
});

test('load a poi already in my favorite from url', async () => {
  await page.goto(APP_URL);
  await storePoi(page, { id: 'osm:way:63178753' });
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  expect(await exists(page, '.icon-icon_star-filled')).toBeTruthy();
});

test('update url after a poi click', async () => {
  await page.goto(APP_URL);
  await clickPoi(page);
  const location = await page.evaluate(() => {
    return document.location.href;
  });
  expect(location).toMatch(/@Mus%C3%A9e_dOrsay/);
});

test('update url after a favorite poi click', async () => {
  await page.goto(APP_URL);
  await storePoi(page, { id: poiMock.id, title: poiMock.name });
  await toggleFavoritePanel(page);
  await page.waitForSelector('.favorite_panel__item__title');
  await page.click('.favorite_panel__item__title');
  const location = await page.evaluate(() => {
    return document.location.href;
  });
  expect(location).toMatch(/@Mus%C3%A9e_dOrsay/);
});

test('open poi from autocomplete selection', async () => {
  await page.goto(APP_URL);
  await page.keyboard.type('test');
  await page.waitForSelector('.autocomplete_suggestion');
  await page.waitFor(100);
  await page.click('.autocomplete_suggestions li:nth-child(2)');
  const location = await page.evaluate(() => {
    return document.location;
  });

  // url is updated
  expect(location.href).toMatch(/osm:way:63178753@Mus%C3%A9e_dOrsay/);
  // poi panel is visible
  expect(await exists(page, '.poi_panel')).toBeTruthy();
});

test('center the map to the poi on a poi click', async () => {
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`);
  await page.waitForSelector('.poiTitle');
  await page.evaluate(() => {
    window.MAP_MOCK.flyTo({ center: { lat: 0, lng: 0 }, zoom: 10 });
  });
  await page.click('.poi_panel__content .poiItem');
  const center = await page.evaluate(() => {
    return window.MAP_MOCK.getCenter();
  });
  expect(center).toEqual({
    lng: poiMock.geometry.coordinates[0],
    lat: poiMock.geometry.coordinates[1],
  });
});

test('Poi name i18n', async () => {
  await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=16.50/48.8602571/2.3262281`);
  await page.waitForSelector('.poiTitle');

  const title = await getTitle(page);
  expect(title.main).toMatch('Musée d\'Orsay');
  expect(title.alternative).toMatch('Orsay museum');
});


test('Test 24/7', async () => {
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
  await clickPoi(page);
  await page.waitForSelector('.poiTitle');

  const hours = await page.evaluate(() => {
    return document.querySelector('.openingHour--24-7').innerText.trim();
  });

  expect(hours).toEqual('Ouvert 24h/24 et 7j/7');
});

test('check invalid Poi URL redirects to base URL', async () => {
  await page.goto(`${APP_URL}/place/osm:way:2403`);
  const pathname = await page.evaluate(() => {
    return location.pathname;
  });
  expect(pathname).toEqual('/maps/');
});

async function clickPoi(page) {
  const mapPoiMock = {
    properties: {
      global_id: poiMock.id,
      name: poiMock.name,
    },
    geometry: poiMock.geometry,
  };
  await page.evaluate(clickedFeature => {
    window.map.clickOnMap({}, clickedFeature);
  }, mapPoiMock);
  const mockPoiBounds = await page.$('#mock_poi').then(e => e.boundingBox());
  // Click on the top-left corner
  await page.mouse.click(mockPoiBounds.x, mockPoiBounds.y);
}

describe('Poi hour i18n', () => {
  languages.supportedLanguages.forEach(language => {
    test(`Poi hour i18n [${language.locale}]`, async () => {
      const langPage = await browser.newPage();
      const httpLocale = language.locale.replace(/_/g, '-');
      await langPage.setExtraHTTPHeaders({
        'accept-language': `${httpLocale},${language.code},en;q=0.8`,
      });
      await langPage.goto(
        `${APP_URL}/place/osm:way:63178753@Musée_dOrsay#map=17.49/2.3261037/48.8605833`
      );
      await langPage.waitForSelector('.timetable');
      const hourData = await getHours(langPage);
      if (language.locale === 'en_US') {
        // Tuesday
        expect(hourData[1][0]).toEqual('Tuesday');
        expect(hourData[1][1]).toEqual('09:30 AM - 06:00 PM');
        // Thursday
        expect(hourData[3][0]).toEqual('Thursday');
        expect(hourData[3][1]).toEqual('12:30 PM - 09:45 PM');
      } else {
        expect(hourData[1][1]).toEqual('09:30 - 18:00');
        expect(hourData[3][1]).toEqual('12:30 - 21:45');
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
    let main = document.querySelector('.poiTitle-main');
    if (main) {
      main = main.innerText.trim();
    }
    let alternative = document.querySelector('.poiTitle-alternative');
    if (alternative) {
      alternative = alternative.innerText.trim();
    }
    return { main, alternative };
  });
}


async function getHours(page) {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.timetable tr')).map(line => {
      return Array.from(line.querySelectorAll('td')).map(cell => {
        return cell.innerText.trim();
      });
    });
  });
}
