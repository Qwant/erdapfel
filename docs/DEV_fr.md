## Notes générales

### Architecture du projet 
 - `/bin/` le serveur applicatif Node.JS/Express
 - `/build/` la config webpack
 - `/config/` partagé par le serveur & par l'appli front
 - `/dev/` scripts utilisés en phase de développement
 - `/docs/` doc (dont ce fichier)
 - `/language/` fichiers de traduction `.po`
 - `/public/` fichiers statiques
 - `/src/` fichiers source de l'appli front
   - `adapters/` interfaces de développement
   - `components/` composants React partagés
   - `hooks/` hooks React
   - `libs/` librairies internes spécifiques
   - `mapbox/` surcharge de classes de composants mapbox
   - `modals/` fenêtres modales
   - `panel/` implémentation des différents panels
   - `scss/` style
   - `vendors/` librairies externes
 - `/tests/` tests automatiques
 - `/views/` templates statiques `.ejs` pour le serveur d'application

Il y a deux points d'entrées à l'application front, cela produit 2 bundles qui communiquent par event ou par window.

###CSS
Le BEM est une convention de nommage orienté composant il rend la maintenance du css plus facile, le trade off est qu'il est un peu verbeux   http://getbem.com/naming/  
Penser à utiliser un fichier par "composant"
Afin d'éviter la guerre des z-index il est plus pratiques de les rassembler dans un seul fichier (ici z_index.scss). cela garantit de ne pas avoir à gérer un z-index:9999

