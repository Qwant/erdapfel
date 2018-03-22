# Qwant Map

**/public/index.html**  
Map webapp with Qwant map tiles and a search input


## Install

### prerequisites

- npm > 5
- node > 6

### run test server
```
> npm install
> npm run build
> npm start
```

### Start micro services
```
>git@github.com:QwantResearch/tz-micro-service.git & start
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
*.js
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


## Deploy

Requirements : Fabric3 (`pip3 install Fabric3`)

### Deploy to dev

First, put your settings in `fab_settings.py` (see `fab_settings.py.example`).

```
> fab dev deploy
```