# Erdapfel

Erdapfel is Qwant Maps front end application. It is a javascript single page app that allows to browse the map, search for places, see your position on the map, etc


## Run

### Configuration

As Qwant Maps front end app, Erdapfel relies on a bunch of other services :
* a geocoder: to search for places
* a POI API: to display some details about the places
* a storage app: to store your favorite places
* a tile server: to display the map

The config is used to tell Erdapfel how to interact with the other components.

A default config file is provided here. This configuration can be overriden by environment variables.
The nesting is handle by the separator `_` and it must be prefixed by `TILEVIEW_`

For instance:
```
system:
  timeout: 5
```  

is overriden by `TILEVIEW_system_timeout=3`

A [small script](https://github.com/QwantResearch/map-style-builder) is used to build the style of the map and to ease the usage of the icons for the front end. The fonts used for the text displayed on the map are also built using an [OpenMapTiles script](https://github.com/QwantResearch/fonts).

For a global overview of Qwant Maps and more details about each component, check out [QwantMaps](https://github.com/QwantResearch/qwantmaps/) repo.

### Run with docker

TODO

### Run from sources

You will need

- npm >= 6
- node >= 8

Then you can build and run Erdapfel with the following commands:

```
> npm install
> npm run build
> npm start
```

## Internationalisation

Translations are managed by `.po` files.

To update the translations files from source code, you can run `npm run build` then `npm run i18n`.

You can also use Poedit to parse source code & maintain po files.

#### Poedit settings
File > Preferences > Parsers > New:

* Language: ```JS```
* List of extension: ```*.js, *.yml```
* Parser command:```xgettext --language=Python --force-po -o %o %C %K %F```
* Item in Keyword List:```-k%k```
* Item in input files list:```%f```
* Source code charset:```--from-code=%c```

and another one with language PHP, and extension `*.ejs`

## Development guide

Here are a few words about the project structure :

### Panel
 _panel_ is the display elementary brick, similar to a web component.
 A panel declaration is a function which contains a panel field

```
function Panel() {
  this.panel = new Panel(this, panelView)
}
```

PanelView is a dot template imported with the following line:

```
import ErrorPanelView from 'dot-loader!../views/error_panel.dot'

```

The panel parent function is the state of the displayed panel.
Ex. function `ErrorPanel()` declare `currentMessage` field
`this.currentMessage = "-error-"`

`currentMessage` will be displayed in the corresponding view like this:
`{{= this.currentMessage }}`

If `this.currentMessage` is updated there is no mechanism to automaticaly redraw `ErrorPanel`, in order to redraw panel with the new state you have to call `this.update()`

#### Helper methods
```
this.panel.addClassName
this.panel.removeClassName
this.panel.toggleClassName
```

Theses methods manage delays with promises mechanics

*note on update* : this method redraw panel resulting on interrupting playing css animation of the current panel

### Events
Communication between components is done by custom event. `fire()` to propagate custom event & `listen()` to trigger the action

Add new event by editing `actions.js`

## Test

### How to test ?
run
`TEST=true npm run build`

then

`npm run test`

### Unit tests
Run unit tests only with `npm run unit-test`


### Integration tests
Run integration tests only with `npm run integration-test`

It will run chrome headless test suite with a mapbox-gl minimalist mock. The config override is done in the server_start file.

*note on mapbox-gl mock*: We include out mapbox-gl mock fork to emulate mapbox-gl behaviour with the advanced support of mocked event & poi.

** hint** : When you debug or add new tests, you may want to launch puppeteer in non headless mode and keep the browser open.

## Doc
You can generate the doc with `npm run doc`


## License

This project is licensed under the Apache License 2.0.

Please not that it depends on many other opensource projects that have their own terms and conditions.
