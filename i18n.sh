#!/bin/bash

set -ev
find config "views/" -name "*.ejs"| xargs xgettext --language=PHP --force-po -o tt.pot --from-code=UTF-8 -
find config -name "*.yml"| xargs xgettext --language=Python --force-po -o tt.pot --from-code=UTF-8 -j -
find bin "public/build/javascript/" -name "*.js"| xargs xgettext --force-po -o tt.pot --from-code=UTF-8 -j -

for i in language/message/*.po; do msgmerge --no-fuzzy-matching --update $i tt.pot  ;done

rm tt.pot
