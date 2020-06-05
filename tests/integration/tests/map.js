import { initBrowser, store, clearStore, getMapView } from '../tools';
let browser;
let page;

beforeAll(async () => {
  const browserPage = await initBrowser();
  page = browserPage.page;
  browser = browserPage.browser;
});

test('priority order with url & local-storage', async () => {
  const center = { lng: 11.1, lat: 43.3 };

  expect.assertions(1);
  await page.goto(APP_URL);
  await store(page, 'qmaps_v1_last_location', { lng: 19, lat: 47, zoom: 18 });
  await page.goto(`${APP_URL}/#map=2.00/${center.lat}/${center.lng}`);
  await page.reload(); // force reload

  const { center: mapCenter } = await getMapView(page);
  expect(mapCenter).toEqual(center);
});

test('test local storage map center', async () => {
  const center = { lng: 11.1, lat: 43.3 };

  expect.assertions(1);
  await page.goto(APP_URL);
  await store(page, 'qmaps_v1_last_location', center);
  await page.goto(APP_URL);
  await page.reload(); // force reload

  const { center: mapCenter } = await getMapView(page);
  expect(mapCenter).toEqual(center);
});

afterEach(async () => {
  await clearStore(page);
});

afterAll(async () => {
  await browser.close();
});
