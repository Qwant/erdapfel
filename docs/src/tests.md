
# Automated tests

## TL;DR

First be sure to stop the web server/dev watcher and build the project in test mode (only once):

```
$ TEST=true npm run build
```

then launch the test suite:

```
$ npm run test
```

### Unit tests only

```
$ npm run unit-test
```

### Integration tests only

```
$ npm run integration-test
```

## Tooling 

Here are some notable tools used in our test suites:
 - [Jest](https://jestjs.io/en/) is our test framework. It provides tools to write tests (lifecycle functions, mocking, assertions, etc.) and run them. It is used for both unit and integration tests.
 - [Puppeteer](https://pptr.dev/) is an API to control programmaticaly a real browser (currently Chrome/-ium). It is used in integration tests to make sure the tests behave like real-life scenarios. By default the browser runs in headless mode.
 - [MapBox-GL-JS-mock](https://github.com/mapbox/mapbox-gl-js-mock), a rather limited mock which is injected in place of the MapBox-GL lib for integration tests. We actually use [our own Qwant fork](https://github.com/QwantResearch/mapbox-gl-js-mock) which adds some missing stuff.


## Test running tips

### Running only some tests

When debugging tests, you may wish to focus on a certain test without bothering on running all the other ones.

#### Limit to a test file

You limit a test suite (unit or integration) to a single test file by specifying it on the command line. For example:

```
$ npm run unit-test -- tests/units/string.js
```

*ℹ️ The `--` option is NPM's way of passing additionnal arguments to an existing string command. See the [Jest doc](https://jestjs.io/docs/en/cli#using-with-npm-scripts).*

#### Limit to a test case

Inside a single test file, you can also limit testing to a single test case (or alternatively, skip some), by adding `.only` (or `.skip`) to the test function:

```js
test.only('htmlEncode', () => {
  // ...
});
```

Which will result in the other tests in the file to be skipped:

```
PASS  tests/units/string.js
  ExtendedString
    ✓ htmlEncode (5ms)
    ○ skipped compareIgnoreCase
    ○ skipped normalize
    ○ skipped slug
```

*⚠️ Using `.only` requires to modify test source files, so beware not to commit it when you are done (we could add this [ESLint plugin](https://www.npmjs.com/package/eslint-plugin-jest) for that).*


### Running tests in watch mode

Another and often better option to limit running tests to what you really need is to run Jest in [watch mode](https://jestjs.io/docs/en/cli#watch). In this mode, the Jest process will stay alive, watching source files for modifications and automatically relaunch only the tests concerned by the changes. 

This is a great time saver during test debugging or <abbr title="Test-Driven Development">TDD</abbr>.

You can run it for unit tests:

```
$ npm run unit-test -- --watch
```

or integration tests:

```
$ npm run integration-test -- --watch
```

This is not possible to run the full suite (unit **and** integration) in watch mode.


### Integration: non-headless mode

For integration tests, you can force Puppeteer to run in full (non-headless) mode, to see what is happening in real-time in a real browser and keep it open.

This requires setting the `headless` env var to false:

```
$ headless=false npm run integration-test
```

*⚠️ As Jest runs tests as independant parallel instances, Puppeteer in headless mode can launch a lot of browser tabs which can slow down your computer.*

To understand what's going on in non-headless mode, it may be useful to slow things down by waiting a bit between each Puppeteer operations. This is done with the `slowMo` option, in milliseconds:

```bash
$ headless=false slowMo=500 npm run integration-test
```


### Integration: screenshots

If you don't need the full non-headless stuff but want to see the state of the page at a specific point, Puppeteer can also [export screenshots](https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#pagescreenshotoptions).

Just add a `page.screenshot` call where you want in the test code.

```js
  //...
  await page.goto(APP_URL);
  await page.keyboard.type('test');
  await page.waitForSelector('.autocomplete_suggestion');
  // A autocomplete1.png file will be generated at the project source
  await page.screenshot({ type: 'png', path: 'autocomplete1.png' });
  await page.click('.autocomplete_suggestion:nth-child(2)');
  //...
```

*⚠️ Use `screenshot` for debugging only, don't commit it to the repo.*
