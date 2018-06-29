# Qwant Maps

**/public/index.html**  
Map webapp with Qwant map tiles and a search input



## Install

### prerequisites

- npm >= 6
- node >= 8

### run test server
```
> npm install
> npm run build
> npm start
```

### Start micro services
```
> git@github.com:QwantResearch/tz-micro-service.git & start
```

## generate doc
```
 > npm run doc
```

## Poedit settings :

File > Preferences > Parsers > New

Language:

```
JS
```
List of extension:
```
*.js, *.yml
```
Parser command:
```
xgettext --language=Python --force-po -o %o %C %K %F
```
Item in Keyword List:
```
-k%k
```
Item in input files list:
```
%f
```
Source code charset:
```
--from-code=%c
```

## Development guide
Two words about the project structure :

### Panel
 _panel_ is the display elementary brick ,similar to a web components.
 A panel declaration is a function which contain a panel field
 ```javascript
function Panel() {
  this.panel = new Panel(this, panelView)
}
```

> PanelView is a dot template imported by the following line

```
import ErrorPanelView from 'dot-loader!../views/error_panel.dot'

```

The panel parent function is the state of the displayed panel.
Ex. function ErrorPanel() declare currentMessage field 
```this.currentMessage = "-error-"```

currentMessage will be displayed in the corresponding view like this 
```{{= this.currentMessage }}``` 
If this.currentMessage is updated there is no mechanic to automaticaly redraw ErrorPanem, in order to redraw panel with the new state you have to call ```this.update()```

### Helper methods
```
this.panel.addClassName
this.panel.removeClassName
this.panel.toggleClassName
```

> Theses methods manage delays with promises mechanics

note on update : this method redraw panel resulting on interrupting playing css animation of the current panel

### Events
Communication between components is done by custom event. fire() to propagate custom event & listen() to trigger the action

#### Native Events implemented : 
 - click
 - .. 
 
> Add new event by editing actions.js  

### i18n
Translations are managed  by .po files. Poedit parse source code & maintain po files

## Deploy
Requirements : Fabric3 (`pip3 install Fabric3`)

### Deploy to dev
First, put your settings in `fab_settings.py` (see `fab_settings.py.example`).


```
> fab dev deploy
```

## Test

### How to test ?
run 
>TEST=true npm run build

then

>npm run test

### All test
you can run all tests with 'npm run test'

### Unit test
unit test with npm run unit-test

## integration test
integration test with npm run integration-test

integration test will run chrome headless test suite with a mapbox-gl minimalist mock

### note on mapbox-gl mock
We include out mapbox-gl mock fork to emulate mapbox-gl behaviour with the advanced support of mocked event & poi.
 
## Configuration
A default config file is given, this configuration can be override by environment variable.
The nesting is handle by the separator '_' and it must be prefixed by 'TILEVIEW_'


By example 
```
system:
  timeout: 3
```  

is override by ```TILEVIEW_system_timeout=3```

## License

This project is licensed under the Apache License 2.0.

Please not that it depends on many other opensource projects that have their own terms and conditions.
