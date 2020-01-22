# Install and contribute to Erdapfel on Windows

## Windows 7 / 8

- Install React Dev Tools in your browser ([chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) / [Firefox](https://addons.mozilla.org/fr/firefox/addon/react-devtools/))
- Install [VirtualBox](https://www.virtualbox.org/)
- Mount [this xubuntu image](http://cdimages.ubuntu.com/xubuntu/releases/18.04/release/xubuntu-18.04.1-desktop-amd64.iso)
- Allocate at least 2 CPU, 4GB of RAM and 20GB of HDD and material acceleration to the VM
- In settings > Network, choose Bridge Adapter
- Inside the VM, install an IDE (enable ESlint plugin), open a terminal
- Clone erdapfel in the folder of your choice (ex: "/home/{username}/www/"): 
```
sudo apt install git
git clone https://github.com/QwantResearch/erdapfel.git
```
- Enter the [commands](#commands) below to build and run Erdapfel
- Retrieve your IP with ```ifconfig``` (just after "inet ...")
<br>Your local instance of Erdapfel will be visible at **http://localhost:3000** in the VM or **http://{ip}:3000** outside of the VM

# Windows 10

- Install React Dev Tools in your browser ([chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) / [Firefox](https://addons.mozilla.org/fr/firefox/addon/react-devtools/))
- Install [NodeJS LTS](https://nodejs.org/en/download/)
- Install [Git](https://git-scm.com/downloads)
- Install [Python](https://www.python.org/downloads/)
- Install an IDE (enable ESlint plugin)
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

- Install Python and its libraries:
```
pyenv install 3.6.8
pyenv install 3.7.2
pyenv global 3.6.8
pip install pip --upgrade
pip install pipenv
pyenv global 3.7.2
pip install pip --upgrade
pip install pipenv
```

- Then enter the [commands](#commands) below to build and run Erdapfel

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