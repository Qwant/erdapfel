#!/bin/bash

set -ev

find config "views/" -name "*.ejs"| xargs xgettext --language=PHP --force-po -o tt.pot --from-code=UTF-8 -
find config "public/build/javascript/" -regex ".*\.\(yml\|js\)"| xargs xgettext --language=Python --force-po -o tt.pot --from-code=UTF-8 -j -

for i in language/message/*.po; do msgmerge --update $i tt.pot  ;done
