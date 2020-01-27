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

- npm >= 6.13
- Node.js 10

Then you can build and run Erdapfel with the following commands:

```
> npm install
> npm run build
# to build in development mode:
> npm run build -- --mode=development
> npm start
```

(see also: [Windows setup guide](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/windows.md)

### Run with docker

Pull the docker image from `qwantresearch/erdapfel` [![Docker Pulls](https://img.shields.io/docker/pulls/qwantresearch/erdapfel.svg)](https://hub.docker.com/r/qwantresearch/erdapfel/)
, set up your config and *voilà* !

## Develop

* [Project structure](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/project_structure.md)
* [Project internationalisation](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/i18n.md)
* [Code convention](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/code_convention.md)
* [Tests](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/tests.md)

[![Travis Build](https://travis-ci.org/QwantResearch/erdapfel.svg?branch=master)](https://travis-ci.org/QwantResearch/erdapfel)

## Using your own map tiles server

We explained earlier how to override some variables using `TILEVIEW_`. If you want to use your own map tiles server(s), you can do it by running with:

```bash
> TILEVIEW_mapStyle_baseMapUrl='["http://your-server/path-to-basemap-tiles/{z}/{x}/{y}.pbf"]' \
TILEVIEW_mapStyle_poiMapUrl='["http://your-server/path-to-poi-tiles/{z}/{x}/{y}.pbf"]' \
npm start
```

`TILEVIEW_mapStyle_baseMapUrl` is for the server providing tiles for the map itself and `TILEVIEW_mapStyle_poiMapUrl` is for the server providing tiles for the POIs.

The part `{z}/{x}/{y}.pbf` is mandatory to tell `erdapfel` how to set the position and zoom.

The `path-to-basemap-tiles` and `path-to-poi-tiles` are paths to where interrogate the server to get map's and POIs' tiles (so it might be different in your case).

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

*For extended information about tests, refer to the [dedicated page](https://github.com/QwantResearch/erdapfel/blob/master/docs/src/tests.md).*

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

### Development tips

If you intend to contribute on the project, those tips might be quite helpful!

#### Get list of the item you're currently seeing on the map

If you want to see all the information provided by an item you're currently seeing on the map, you can do it with your web browser development console. Please note that it's **simpler** to do when there are very few objects displayed, so at very high level of zoom is better:

```js
let objs = window.map.mb.queryRenderedFeatures();
# objs is an array, just look each entry to find the one you're looking for!
```

A note on `window.map.mb`: it is the mapbox-gl object. You might be interested into looking to [mapbox-gl](https://docs.mapbox.com/mapbox-gl-js/api) documentation for more features. You can find the `queryRenderedFeatures`'s documentation [here](https://docs.mapbox.com/mapbox-gl-js/api/#map#queryrenderedfeatures).

#### Change maximum zoom

It can be useful in case you want to debug an object in an area with a lot of items, even at the current maximum zoom:

```js
# in your web browser development console:
window.map.mb.setMaxZoom(25); # default maximum zoom is 20
```

## License

[![GitHub license](https://img.shields.io/github/license/QwantResearch/erdapfel.svg)](https://github.com/QwantResearch/erdapfel/blob/master/LICENSE)

This project is licensed under the Apache License 2.0.

Please not that it depends on many other opensource projects that have their own terms and conditions.
