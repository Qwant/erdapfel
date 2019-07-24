# Erdapfel

Erdapfel is [Qwant Maps](https://www.qwant.com/maps/) front end application. It is a javascript single page app that allows to browse the map, search for places, see your position on the map, etc

![Qwant Maps screenshot](https://raw.githubusercontent.com/QwantResearch/qwantmaps/master/screenshot.png)

For a global overview of Qwant Maps and more details about each component, check out [QwantMaps](https://github.com/QwantResearch/qwantmaps/) repo.

## Run

### Configuration

As Qwant Maps front end app, Erdapfel relies on a bunch of other services and needs some config to define how to interact with these components.

A default config file is provided [here](https://github.com/QwantResearch/erdapfel/blob/master/config/default_config.yml). You will need to update it to set some services url, for instance:
* the tile server: to display the map
* the geocoder: to search for places
* the place API: to display some details about the places
* the storage app: to store your favorite places

The configuration can be overriden by environment variables.
The nesting is handle by the separator `_` and it must be prefixed by `TILEVIEW_`

For instance:
```
system:
  timeout: 5
```  

is overriden by `TILEVIEW_system_timeout=3`


### Run from sources

You will need

- npm >= 6
- node >= 8

Then you can build and run Erdapfel with the following commands:

```
> npm install
> npm run build
# to build in development mode:
> npm run build -- --mode=development
> npm start
```

### Run with docker

Pull the docker image from `qwantresearch/erdapfel` [![Docker Pulls](https://img.shields.io/docker/pulls/qwantresearch/erdapfel.svg)](https://hub.docker.com/r/qwantresearch/erdapfel/)
, set up your config and *voilà* !

## Develop

* [Project structure](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/project_structure.md)
* [Project internationalisation](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/i18n.md)
* [Code convention](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/code_convention.md)

[![Travis Build](https://travis-ci.org/QwantResearch/erdapfel.svg?branch=master)](https://travis-ci.org/QwantResearch/erdapfel)

#### Local node TLS errors (only for development and debug, **NOT** production!!!)

Some requests to node server could trigger this message on node server logs:

```text
"msg":"unable to get local issuer certificate"
```

You can overpass this error by setting `NODE_TLS_REJECT_UNAUTHORIZED=0` on the server environment such as:

```bash
> NODE_TLS_REJECT_UNAUTHORIZED=0 npm run start
```

Note that you are **NEVER** supposed to use this option for anything else than development.

### A note about webfont

The icon font comes from icomoon, the icomoon project is kept in `dev/erdapfel_iconmoon.json` file. You can open it by drag and drop this file on the icomoon web page.

### Test

run `TEST=true npm run build` then `npm run test` to launch all tests.

#### Unit tests

Run unit tests only with `npm run unit-test`

#### Integration tests
Run integration tests only with `npm run integration-test`

It will run chrome headless test suite with a mapbox-gl minimalist mock. The config override is done in the server_start file.

*note on mapbox-gl mock*: We include out mapbox-gl mock fork to emulate mapbox-gl behaviour with the advanced support of mocked event & poi.

**hint** : When you debug or add new tests, you may want to launch puppeteer in non headless mode and keep the browser open by setting the environment variable `headless` to `false`.

### Benchmark

`npm run bench ` will build a production bundle and return size and js execution time metrics to compare evolution of application performance along the project life time.


## EntryPoints

#### Style
 ` /style.json  ` gives access to prebuilt style with (optional) language.

A [small script](https://github.com/QwantResearch/map-style-builder) is used behind the scene to build the style of the map and to ease the usage of the icons for the front end. The fonts used for the text displayed on the map are also built using an [OpenMapTiles script](https://github.com/QwantResearch/fonts).

Parameters:

  |method |name |value       |optional |default |
  |-------|-----|------------|---------|--------|
  |get    |lang |en, gb ...  |true     |en      |




## License

[![GitHub license](https://img.shields.io/github/license/QwantResearch/erdapfel.svg)](https://github.com/QwantResearch/erdapfel/blob/master/LICENSE)

This project is licensed under the Apache License 2.0.

Please not that it depends on many other opensource projects that have their own terms and conditions.
