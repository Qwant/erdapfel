#!/bin/bash

set -e

npm run build
npm run i18n
pip install virtualenv
virtualenv ~/env
. ~/env/bin/activate
pip install transifex-client
sudo echo $'[https://www.transifex.com]\nhostname = https://www.transifex.com\nusername = '"$TRANSIFEX_API_USER"$'\npassword = '"$TRANSIFEX_API_KEY"$'\n' > ~/.transifexrc
tx push -st
