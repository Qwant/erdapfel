# Install and run Erdapfel on Windows 10

- Install [NodeJS LTS](https://nodejs.org/en/download/)
- Install [Python](https://www.python.org/downloads/)
- From an Admin account, enable developer mode (Start menu > Settings > Updates & Security > For developers > check "Developer mode")
<br>And enable WSL (Settings > Apps > Programs and features > Turn Windows features on or off > enable "Windows Subsystem for Linux")
- Then from any account, install [Ubuntu from Microsoft Store](https://www.microsoft.com/fr-fr/p/ubuntu/9nblggh4msv6?activetab=pivot:overviewtab)
- Clone Erdapfel in the folder of your choice (ex: "C:\www\") using [Github Desktop](https://desktop.github.com/) or the terminal: 

```
sudo apt install git
git clone https://github.com/QwantResearch/erdapfel.git
```

- Open a Ubuntu bash in this folder (shift + right-click > Open Linux CLI here)
- Install tools, libraries and Python installer:

```
sudo apt update && sudo apt install -y build-essential git libexpat1-dev libssl-dev zlib1g-dev \
libncurses5-dev libbz2-dev liblzma-dev \
libsqlite3-dev libffi-dev tcl-dev linux-headers-generic libgdbm-dev \
libreadline-dev tk tk-dev
curl https://pyenv.run | bash
```

- Edit ~/.bashrc (ex: ```nano ~/.bashrc```) and add this code at the end (replace {USERNAME} with your Windows session name):

```
export PATH="/home/{USERNAME}/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```

- Install Python 3 and its libraries:

```
pyenv install 3.7.2
pyenv global 3.7.2
pip install pip --upgrade
pip install pipenv
```

- Then enter the [commands](#commands) below to build and run Erdapfel
- You'll be able to browse your local Qwant Maps instance on [http://localhost:3000](http://localhost:3000)

## Windows 7 / 8

These versions on Windows are not recommended, as they don't include a Linux subsystem.
<br>Linux is necessary to build certain resources used by the map, like WebGL fonts.
<br>If you *really* need to build Erdapfel on these OS, you'll need to use a Linux virtual machine (for example: [VirtualBox](https://www.virtualbox.org/) + [xubuntu](http://cdimages.ubuntu.com/xubuntu/releases/18.04/release/xubuntu-18.04.1-desktop-amd64.iso) + bridge connection)
<br>Run the [commands](#commands) below inside the VM, then get the VM's IP with `ifconfig`, and you'll be able to browse your local Qwant Maps instance on [http://IP:3000](http://IP:3000)

# Commands

- Install tools (you only need to do it once):
```
sudo apt install python3
sudo apt install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash # see https://github.com/creationix/nvm#install-script
source ~/.bashrc
nvm install 8.9.0
npm i webpack -g
npm i webpack-cli -g
```

- Add environment variables (replace "your-domain.com" urls with your own tile/poi/geocoder server and "test" with your Mapbox.com API key):

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