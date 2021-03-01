# qwant-maps-common

## Usage

### Get the category name for a place

```js
import { getPlaceCategoryName } from '@qwant/qwant-maps-common';

const { subclass } = place;
const categoryName = getPlaceCategoryName({ subclass }, "fr");
````

## Workflow in Erdapfel

By default, this package is installed and built automatically, as it's defined as a workspace in Erdapfel package.

The following operations are only useful if modifications are applied in this package.


### Update language files

```
npm run i18n-scan
```

All languages files in `./i18n` are updated with the translations keys that appear in `./src`.


### Rebuild the package

```
npm run build
```

Output files are generated in `./dist/`.


### Publish a new version

After you applied your modifications, and translations are up-to-date, you may publish a new release.

* Update the version number in "package.json"
* Run `npm publish`
