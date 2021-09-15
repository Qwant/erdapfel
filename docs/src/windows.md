# Install and run Erdapfel on Windows 10+

- Install [NodeJS LTS](https://nodejs.org/en/download/)
- Install [WSL2 with Ubuntu](https://docs.microsoft.com/fr-fr/windows/wsl/install-win10) (the username can only contain characters /a-z/)
- Clone Erdapfel in the folder of your choice (ex: "C:\www\") using [Github Desktop](https://desktop.github.com/) or the terminal: 

```
sudo apt install git
git clone https://github.com/Qwant/erdapfel.git
```

- Open a Ubuntu bash in this folder (shift + right-click > Open Linux CLI here)
- Install [nvm](https://github.com/nvm-sh/nvm#install--update-script), then node 12 (`nvm install 12` + `nvm use 12`), then update npm (`npm install -g npm@7`)
- Install tools, libraries:

```
sudo apt update && sudo apt install -y build-essential git libexpat1-dev libssl-dev zlib1g-dev \
libncurses5-dev libbz2-dev liblzma-dev \
libsqlite3-dev libffi-dev tcl-dev linux-headers-generic libgdbm-dev \
libreadline-dev tk tk-dev
sudo apt-get install gettext
```

- Then enter the [commands](#commands) below to build and run Erdapfel
- You'll be able to browse your local Qwant Maps instance on [http://localhost:3000](http://localhost:3000)

# Commands

- Add environment variables (replace "your-domain.com" urls with your own tile/poi/geocoder server and "test" with your Mapbox.com API key). Or if you're a Qwant Maps dev, use the internal .env file

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

- Install Erdapfel's dependencies (you need to do it once, and redo it if you empty /node_modules/ or if package.json has changed):

```
npm install
```

- Launch Erdapfel's web server

```
npm start
```

- Launch Erdapfel's code watcher (auto-rebuild the project)

```
npm watch
```

- If W10's Linux Bash stops resolving domain names, here's a fix ([source](https://github.com/microsoft/WSL/issues/3268#issuecomment-485096972)):

```
sudo rm /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf
sudo chmod 444 /etc/resolv.conf
```

(you can replace "1.1.1.1" with your favourite DNS)
