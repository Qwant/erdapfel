#!/bin/bash

set -ev
find config "views/" -name "*.ejs"| xargs xgettext --language=PHP -k_n:1,2 --force-po -o tt.pot --from-code=UTF-8 -
find config -name "*.yml"| xargs xgettext --language=Python -k_n:1,2 --force-po -o tt.pot --from-code=UTF-8 -j -
find bin src -name "*.js" | xargs xgettext -k_n:1,2 --force-po -o tt.pot --from-code=UTF-8 -j -
find src -name "*.jsx" | xargs xgettext --language=Python -k_n:1,2 --force-po -o tt.pot --from-code=UTF-8 -j -

for i in language/message/*.po; do msgmerge --no-fuzzy-matching -F --update $i tt.pot  ;done

rm tt.pot
