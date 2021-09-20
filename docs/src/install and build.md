# How to install, build and run Erdapfel

(Instructions for all OS's, specific instructions for Windows 10+)
- On Windows+, Install [WSL2 with Ubuntu](https://docs.microsoft.com/fr-fr/windows/wsl/install-win10)
- Clone Erdapfel in the folder of your choice using [Github Desktop](https://desktop.github.com/) or the terminal: 

```
sudo apt install git
git clone https://github.com/Qwant/erdapfel.git
```

- Open a terminal in the "erdapfel" folder (on Windows: shift + right-click > Open Linux CLI here)
- Install [nvm](https://github.com/nvm-sh/nvm#install--update-script), then node 12 (`nvm install 12` + `nvm use 12`), then npm 7 (`npm install -g npm@7`)
- Install the project's tools and libraries:

```
sudo apt update && sudo apt install -y build-essential git libexpat1-dev libssl-dev zlib1g-dev \
libncurses5-dev libbz2-dev liblzma-dev \
libsqlite3-dev libffi-dev tcl-dev linux-headers-generic libgdbm-dev \
libreadline-dev tk tk-dev
sudo apt-get install gettext
```

- Add environment variables (replace "your-domain.com" urls with your own tile/poi/geocoder server and "test" with your Mapbox.com API key).
Or if you're a Qwant Maps developer, use our internal .env file

```
export TILEVIEW_services_geocoder_url="https://your-domain.com/maps/geocoder/autocomplete"
export TILEVIEW_services_idunn_url="https://your-domain.com/maps/detail"
export TILEVIEW_mapStyle_baseMapUrl="[\"https://your-domain.com/maps/tiles/ozbasemap/{z}/{x}/{y}.pbf\"]"
export TILEVIEW_mapStyle_poiMapUrl="[\"https://your-domain.com/maps/tiles/ozpoi/{z}/{x}/{y}.pbf\"]"
export TILEVIEW_direction_enabled=true
export TILEVIEW_direction_service_token=test # <= insert mapbox.com directions API token here
export TILEVIEW_system_evalFiles=false
export TILEVIEW_category_enabled=true
export TILEVIEW_events_enabled=false
```

- Install Erdapfel's dependencies (only do it on the first install, or after emptying /node_modules/ or updating package.json):

```
npm install
```

- Launch Erdapfel's web server (your local Qwant Maps instance will be on [http://localhost:3000](http://localhost:3000))


```
npm run start
```

- Launch Erdapfel's code watcher (auto-rebuild the project)

```
npm run watch
```

or build the project manually

```
npm run build
```


- on Windows, if the Linux VM stops resolving domain names, here's a fix ([source](https://github.com/microsoft/WSL/issues/3268#issuecomment-485096972)):

```
sudo rm /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf
sudo chmod 444 /etc/resolv.conf
```

(you can replace "1.1.1.1" with your favourite DNS)