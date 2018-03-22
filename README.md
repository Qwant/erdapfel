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


### development guide

2 mots sur le découpage du projet map

## Panel
 un _panel_ est une brique élémentaire d'affichage, similaire à un composant-web
 c'est une fonction js qui contient un champ panel 
 ```javascript
function Panel() {
  this.panel = new Panel(this, panelView)
}
```
> PanelView et un template construit comme suit 
```
import ErrorPanelView from 'dot-loader!../views/error_panel.dot'

```

Un panel peut inclure un etat, par exemple un message 
```this.message```
Cet etat peut etre utilisé dans le template ```{{= this.message }}``` si message change, le panel n'est pas mis à jours automatiquement, il faut appeler ```this.update()```

### methode assistantes
```
this.panel.addClassName
this.panel.removeClassName
this.panel.toggleClassName
```
>ces methodes gerent les délais et retourne une promesse résolu a la fin du délais

```
this.update 
```
> note sur update : cette methode rédessine le panel cela peut interrompre les animations de ce panel

## Events
La communication inter composants se fait par des event customs lancé par fire() et attendus par listen()
la gestion d'event HTML se fait par un gestionnaire d'évenement 
### Evénements gérés : 
 - click
 - .. 
> L'ajout d'evenement se fait dans le fichier actions.js  

## i18n

Les traductions se font par le biais des fichiers .po, peuplé par poedit


## Deploy

Requirements : Fabric3 (`pip3 install Fabric3`)

### Deploy to dev

First, put your settings in `fab_settings.py` (see `fab_settings.py.example`).

```
> fab dev deploy
```