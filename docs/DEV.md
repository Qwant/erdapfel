##Notes générales

### Architecture du projet 

*/bin/* le serveur applicatif
*/build/* la config webpack
*/config/* partagé par le serveur & par l'appli front
*/dev/* le fichier de travail d'icomoon ainsi que script de monitoring du projet front
*/docs/* documentation générés + config du generateur + ce fichier
*/language/* fichier i18n (po + locales)
*/public/* fichiers statiques
*/src/* fichiers source de l'appli front
	/adapteurs/ interfaces de developpement 
	/libs/ libraries internes spécifiques
	/mapbox/ surcharge de classes de composants mapbox
	/modals/ fenetres modales
	/panel/ les panneux mobiles (orchestrés par panel manager)
	/proxies/ orchestrateurs (panels & url)
	/scss/ style
	/ui_components/ surcharge de classes des autocompletes
	/vendors librairies externes
	/view/ dot files
*/tests/* tests automatiques
*/views/* fichiers ejs pour le serveur d'application



Il y a deux points d'entrés à l'application front, cela produit 2 bundles qui communiquent par event ou par window.

###CSS

Le BEM est une convension de nommage orienté composant il rend la maintenance du css plus facile, le trade off est qu'il est un peu verbeux   http://getbem.com/naming/  

Penser à utiliser un fichier par "composant"

Affin d'éviter la guere des z-index il est plus pratiques de les rassembler dans un seul fichier (ici z_index.scss). cela garanti de ne pas avoir a gerrer un z-index:9999



### JS

En general il est toujour possible si on fait un querySelector pour modifier le dom on risque de ne pas mettre à jours le state de l'app et de generer une inconsistance.





## TODO

Npm install a pour post script la generation les fontes il doit être possible de  faire une verification avant de faire l'installation systematique.

Les fichiers dots sont terribles, trop dissociés du code metier

il serait interessant de revenir sur la dissociation etre les deux fichiers et de laisser webpack se charger du chargement lazy. Il faudrait laisser à scene.js le chargement de la lib mapbox (scene étant une interface pour cette lib tout le reste du projet est agnostique à mapboxgl).
ensuite integrer scene dans app.js puis retirer tous les soft binding (fire / listen / window.) 

Il y a un ticket tech debt sur Jira

il est fastidieux de mettre à jours une icone par iconmoon, il doit etre possible d'automatiser la tache.

