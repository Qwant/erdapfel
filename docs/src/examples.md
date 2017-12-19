# Exemples d'intégration de la carte

Cette page sert de référence pour intégrer Qwant Maps dans différents produits.

## Instant Answer

![exemple d'intégration de type Instant Answer](../images/InstantAnswer.png)
_fond de carte non contractuel_

Une page complète contenant cet exemple est disponible dans ce repo : `example_instant_answer.html`.

On considère que le géocodeur renvoie un `Object` JavaScript. Plus d'informations [ici](https://www.mapbox.com/mapbox-gl-js/api/#geojsonsource).

```js
const geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [2.5062190, 48.7462549], // coordonnées du point à afficher
    },
    properties: {
      title: '15 Rue de la Procession - 94470 Boissy-Saint-Léger', // informations textuelles à afficher
      bbox: [
        [2.50283, 48.74369],
        [2.51125, 48.74679],
      ],
    },
  }],
}
```

### Installation

La bibliothèque MapboxGL _v0.41.0_ est requise pour afficher les cartes.

```html
<head>
  ...
  <link rel="stylesheet" href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.css" />
</head>
```

```html
<body>
  ...
  <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.js"></script>
</body>
```


### Chargement de la carte

```html
<body>
  <!-- un container vide permet d'injecter la carte sur la page -->
  <div id="map"></div>
  ...
  <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.js"></script>
  <!-- la globale mapboxgl est accessible après l'import de mapbox-gl.js -->
  <script src="index.js"></script>
</body>
```

```js
//index.js

const { Map } = mapboxgl
const { coordinates } = geojson.features[0].geometry

const map = new Map({
  container: 'map', // l'id du container cible
  style: 'qwant_style.json', // le style Qwant Maps
  zoom: 10, // information sur le niveau de zoom à afficher
  center: coordinates, // les coordonnées au centre de la carte
})
```

### Définition des contrôles de la carte

```js
//index.js

const { Map, FullscreenControl, NavigationControl } = mapboxgl

...

map.addControl(new FullscreenControl()) // Activation du plein écran
map.addControl(new NavigationControl()) // Affichage des contrôles (requis)
```

### Affichage du marqueur

Le centre du marqueur sera utilisé par défaut pour le positionnement. Pour un marqueur de type pin, ne pas oublier d'ajouter une option `icon-anchor`.

```js
// index.js

map.addLayer({
  id: 'points',
  type: 'symbol',
  source: {
    type: 'geojson',
    data: geojson,
  },
  layout: {
    icon-image: 'marker',
    icon-anchor: 'bottom',
    icon-size: 0.25,
  },
})
```

### Ajustement du zoom


Si on dispose d'une bbox:

```js
// index.js

const { bbox } = geojson.features[0].properties

...

if (bbox) {
  map.fitBounds(bbox, {
    padding: {
      top: 10,
      bottom: 25,
      left: 15,
      right: 5,
    },
  })
}

```



## Liens utiles

* [Documentation de l'API Mapbox GL](https://www.mapbox.com/mapbox-gl-js/api)
* [Documentation du style Mapbox GL(pour affiner le style du marqueur)](https://www.mapbox.com/mapbox-gl-js/style-spec)
