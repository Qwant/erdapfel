import { initBrowser, exists, isHidden, getInputValue } from '../tools';

async function gotoRestaurantCategory(page) {
  await page.goto(`${APP_URL}/places/?type=restaurant`);
  await page.waitForSelector('.category__panel');
}

async function clickInputClearButton(page) {
  // click either the mobile or desktop button, depending on which is visible
  const handler = await Promise.race([
    page.waitForSelector('#clear_button_mobile', { visible: true }),
    page.waitForSelector('#clear_button_desktop', { visible: true }),
  ]);
  await handler.click();
}

let browser;
let page;

beforeAll(async () => {
  browser = (await initBrowser()).browser;
});

beforeEach(async () => {
  page = await browser.newPage();
});

describe('Opening/closing', () => {
  test('the category panel is opened via category button', async () => {
    await page.goto(APP_URL);
    await page.waitForSelector('.service_panel__categories .mainActionButton');
    await page.click('.service_panel__categories .mainActionButton');
    await page.waitFor(200);
    expect(await exists(page, '.category__panel')).toBeTruthy();
  });

  test('the category panel is opened via direct url', async () => {
    await page.goto(`${APP_URL}/places/?type=restaurant`);
    expect(await exists(page, '.category__panel')).toBeTruthy();
  });

  test('the category panel is closed by navigating backwards', async () => {
    await page.goto(APP_URL);
    await page.waitForSelector('.service_panel__categories');
    await page.click('.service_panel__categories .mainActionButton');
    await page.waitForSelector('.category__panel');
    await page.goBack();
    expect(await isHidden(page, '.category_panel')).toBeTruthy();
  });

  test('the category panel is closed by clicking the search input clear button', async () => {
    await gotoRestaurantCategory(page);
    await clickInputClearButton(page);
    expect(await isHidden(page, '.category_panel')).toBeTruthy();
  });
});

describe('Search input content', () => {
  test('the category name is displayed in the search input', async () => {
    await gotoRestaurantCategory(page);
    const searchValueInput = await getInputValue(page, '#search');
    expect(searchValueInput).toEqual('Restaurant');
  });

  test('the category name is removed from the search input when closing the panel', async () => {
    await gotoRestaurantCategory(page);
    await clickInputClearButton(page);
    const searchValueInput = await getInputValue(page, '#search');
    expect(searchValueInput).toEqual('');
  });
});

// @TODO:
// Query in input (see autocomplete test)
// Data fetching
// PagesJaunes or not
// Empty result/error cases
// Click on map (POI, empty area, etc.)

afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await browser.close();
});
