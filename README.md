# Qwant Map

Display tiles based on [Klokantech Basic](https://openmaptiles.org/styles/#klokantech-basic) style
from [openmaptiles](https://openmaptiles.org/)

**/public/index.html**  
Map with custom tiles and remote geocoder (photon)


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
