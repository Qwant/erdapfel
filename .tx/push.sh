#!/bin/bash
set -e

npm run build -- --mode=production
npm run i18n
python3.5 -m pip install --user "urllib3>=1.21.1,<1.24" transifex-client==0.13.5
sudo echo $'[https://www.transifex.com]\nhostname = https://www.transifex.com\nusername = '"$TRANSIFEX_API_USER"$'\npassword = '"$TRANSIFEX_API_KEY"$'\n' > ~/.transifexrc
tx push -s
