import { initBrowser, isHidden } from '../tools';

let browser;
let page;

beforeAll(async () => {
  browser = (await initBrowser()).browser;
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.setViewport({ width: 580, height: 240 }); // standard IA size
});

test('UI elements are hidden', async () => {
  await page.goto(APP_URL + '/?no_ui=1');
  await page.waitForSelector('.panel');
  const uiElements = ['.top_bar', '.menu__button', '.panel_container', '.map_control_group'];
  for (const selector of uiElements) {
    expect(await isHidden(page, selector)).toBeTruthy();
  }
});

// @TODO: other tests to add
// - the map and its POIs don't react to clicks
// - all the IA modes

afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await browser.close();
});
