##Notes générales

### Architecture du projet 
 - */bin/* le serveur applicatif
 - */build/* la config webpack
 - */config/* partagé par le serveur & par l'appli front
 - */dev/* le fichier de travail d'icomoon ainsi que script de monitoring du projet front
 - */docs/* documentation générés + config du générateur + ce fichier
 - */language/* fichier i18n (po + locales)
 - */public/* fichiers statiques
 - */src/* fichiers source de l'appli front
  - /adapteurs/ interfaces de développement 
  - /libs/ librairies internes spécifiques
  - /mapbox/ surcharge de classes de composants mapbox
  - /modals/ fenêtres modales
  - /panel/ les panneaux mobiles (orchestrés par panel manager)
  - /proxies/ orchestrateurs (panels & url)
  - /scss/ style
  - /ui_components/ surcharge de classes des autocompletes
  - /vendors librairies externes
  - /view/ dot files
 - */tests/* tests automatiques
 - */views/* fichiers ejs pour le serveur d'application

Il y a deux points d'entrées à l'application front, cela produit 2 bundles qui communiquent par event ou par window.

###CSS
Le BEM est une convention de nommage orienté composant il rend la maintenance du css plus facile, le trade off est qu'il est un peu verbeux   http://getbem.com/naming/  
Penser à utiliser un fichier par "composant"
Afin d'éviter la guerre des z-index il est plus pratiques de les rassembler dans un seul fichier (ici z_index.scss). cela garantit de ne pas avoir à gérer un z-index:9999

### JS
En général il est toujours possible si on fait un querySelector pour modifier le dom on risque de ne pas mettre à jour le state de l'app et de générer une inconsistance.

## TODO
Npm install a pour post script la génération les fontes il doit être possible de  faire une vérification avant de faire l'installation systématique.

Les fichiers .dot sont terribles, trop dissociés du code metier

Il serait intéressant de revenir sur la dissociation entre les deux fichiers et de laisser webpack se charger du chargement lazy. Il faudrait laisser à scene.js le chargement de la lib mapbox (scene étant une interface pour cette lib tout le reste du projet est agnostique à mapboxgl).
ensuite intégrer scene dans app.js puis retirer tous les soft bindings (fire / listen / window.)

Il y a un ticket tech debt sur Jira

Il est fastidieux de mettre à jour une icône par iconmoon, il doit être possible d'automatiser la tache.
