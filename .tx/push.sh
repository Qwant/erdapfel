#!/bin/bash
set -e

npm run build -- --mode=production
npm run i18n
# Remove msgstr from en.po so that it's considered as a .pot template file by Transifex
msgfilter --keep-header -i language/message/en.po -o language/message/en.po true

sudo pip3 install transifex-client==0.13.12
sudo echo $'[https://www.transifex.com]\nhostname = https://www.transifex.com\nusername = '"$TRANSIFEX_API_USER"$'\npassword = '"$TRANSIFEX_API_KEY"$'\n' > ~/.transifexrc
tx push -s
