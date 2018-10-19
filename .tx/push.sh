#!/bin/bash
set -e

npm run build -- --mode=production
npm run i18n
pip3 install --user pipenv
pipenv install transifex-client
sudo echo $'[https://www.transifex.com]\nhostname = https://www.transifex.com\nusername = '"$TRANSIFEX_API_USER"$'\npassword = '"$TRANSIFEX_API_KEY"$'\n' > ~/.transifexrc
pipenv run tx push -st
