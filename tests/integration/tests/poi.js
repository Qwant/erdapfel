const poiMock = require('../../__data__/poi.json');

import ResponseHandler from '../helpers/response_handler';
import {
  getInputValue,
  initBrowser,
  getText,
  clearStore,
  exists,
  simulateClickOnMapPoi,
} from '../tools';
import { storePoi } from '../favorites_tools';
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
    'accept-language': 'fr_FR,fr,en;q=0.8' /* force fr header */,
  });
  responseHandler = new ResponseHandler(page);
  await responseHandler.prepareResponse();

  const autocompleteMock = require('../../__data__/autocomplete.json');
  responseHandler.addPreparedResponse(autocompleteMock, /autocomplete/);
  responseHandler.addPreparedResponse(poiMock, /places\/osm:way:63178753(\?[^?]*)?$/);
});

describe('Opening conditions', () => {
  test('click on a POI on the map', async () => {
    await page.goto(APP_URL);
    await simulateClickOnMapPoi(page, poiMock);
    expect(await exists(page, '.poiItem')).toBeTruthy();
    const translatedSubClass = await getText(page, '.poiItem-subclass');
    expect(translatedSubClass).toEqual('Musée');
  });

  test('select a POI from the autocomplete', async () => {
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

  test('load a POI from url', async () => {
    await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay`);
    await page.waitForSelector('.poiTitle');
    const title = await page.evaluate(() => document.querySelector('.poiTitle').innerText);
    expect(title).toMatch(/Musée d'Orsay/);
  });

  test('load a POI from url with simple id', async () => {
    await page.goto(`${APP_URL}/place/osm:way:63178753?client=example`);
    await page.waitForSelector('.poiTitle');
    const title = await page.evaluate(() => document.querySelector('.poiTitle').innerText);
    expect(title).toMatch(/Musée d'Orsay/);
  });

  test('an invalid POI url redirects to the home', async () => {
    await page.goto(`${APP_URL}/place/osm:way:2403`);
    const pathname = await page.evaluate(() => {
      return location.pathname;
    });
    expect(pathname).toEqual('/maps/');
  });
});

describe('Side effects', () => {
  test('the url, page title and search content reflect the current POI', async () => {
    await page.goto(APP_URL);
    await simulateClickOnMapPoi(page, poiMock);
    const { url, title } = await page.evaluate(() => {
      return { url: document.location.href, title: document.title };
    });
    expect(url).toMatch(poiMock.id);
    expect(title).toMatch(poiMock.name);
    const mainSearch = await getInputValue(page, '#search');
    expect(mainSearch).toEqual(poiMock.name);
  });

  test('center the map on the POI when clicking its header', async () => {
    await page.goto(`${APP_URL}/place/${poiMock.id}`);
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
});

describe('Content', () => {
  test('the POI alternative title is displayed if needed', async () => {
    await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay`);
    await page.waitForSelector('.poiTitle');

    const title = await getTitle(page);
    expect(title.main).toMatch("Musée d'Orsay");
    expect(title.alternative).toMatch('Orsay museum');
  });

  test('display an info section', async () => {
    await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay`);
    await page.waitForSelector('.poiTitle');

    const { address, contact, phone, website, accessibility } = await page.evaluate(() => {
      return {
        address: document.querySelector('.block-address .block-value').innerText,
        contact: document.querySelector('.block-contact').innerText,
        phone: document.querySelector('.block-phone').innerText,
        website: document.querySelector('.block-website').innerText,
        accessibility: document.querySelector('.block-accessibility').innerText,
      };
    });
    expect(address).toEqual("1 Rue de la Légion d'Honneur, 75007 Paris");
    expect(await exists(page, '.poi_panel .openingHour--closed')).toBeTruthy();
    expect(phone).toMatch('01 40 49 48 14');
    expect(website).toMatch('www.musee-orsay.fr');
    expect(contact).toMatch('admin@orsay.fr');
    expect(await exists(page, '.block-description')).toBeTruthy();
    expect(accessibility).toMatch('Accessible en fauteuil roulant');
  });

  test('display a favorite POI with the correct button status', async () => {
    await page.goto(APP_URL);
    await storePoi(page, { id: 'osm:way:63178753' });
    await page.goto(`${APP_URL}/place/osm:way:63178753@Musée_dOrsay`);
    expect(await exists(page, '.poi_panel__action__favorite[data-active=true]')).toBeTruthy();
  });

  describe('Opening hours', () => {
    languages.supportedLanguages.forEach(language => {
      test(`i18n [${language.locale}]`, async () => {
        const langPage = await browser.newPage();
        const httpLocale = language.locale.replace(/_/g, '-');
        await langPage.setExtraHTTPHeaders({
          'accept-language': `${httpLocale},${language.code},en;q=0.8`,
        });
        await langPage.goto(`${APP_URL}/place/${poiMock.id}`);
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

    test('24/7 opening hours are correctly formatted', async () => {
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
      await simulateClickOnMapPoi(page, poiMock);
      await page.waitForSelector('.poiTitle');

      const hours = await page.evaluate(() => {
        return document.querySelector('.openingHour--24-7').innerText.trim();
      });

      expect(hours).toEqual('Ouvert 24h/24 et 7j/7');
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
