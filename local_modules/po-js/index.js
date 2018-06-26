'use strict';
/**
 * po-json
 *
 *
 * Copyright Qwant 2017
 * Licensed under the MIT license.
 *
 * Accepts the contents of a po filereturn translations.
 * NB: this function was rewritten for this fork
 *
 * @param {[String]} lines the contents of a po file.
 * @returns {Object} The translations in name-value pairs.
 */
module.exports = function(lines,  options) {
  // Prepare output
  var options = options || {};
  var manageContext = options.manageContext;
  var entries = {};

  // Split input in lines

  // Next information to read:
  // 0: msgctxt
  // 1: msgid
  // 2: comment msgstr
  // 3: regular msgstr or msgid_plural
  // 4: msgstr[0]
  // 6: msgstr[1]
  // 6: msgstr[2]
  var next = 0;

  var pluralCount = 0;
  var regex = '';
  var j = 0;

  var id = "", id_plural = "", msg = "", msg_plural = "", msg_options = "", context = "";

  // Loop on lines
  for (var i = 0; i < lines.length; i++) {

    // Ignore empty lines
    if (/^ *$/.test(lines[i])) {
      continue;
    }

    // Ignore comments ("# ...")
    if (/^ *#.*$/.test(lines[i])) {
      continue;
    }

    if (msg_options === "" && /msgid ""/.test(lines[i])) {
      j = i + 1;
      while (/^".*"$/.test(lines[j+1])) {
        msg_options += /^"(.*)"$/.exec(lines[j+1])[1];
        j++;
      }
      var options_tmp = msg_options.split("\\n");
      for (var k = 0, n = options_tmp.length; k < n; k++) {
        if (options_tmp[k] != "") {
          var option = options_tmp[k];
          var l = option.indexOf(': ');
          if (option.slice(0,l) == "Plural-Forms") {
            options['plural'] = option.slice(l+2);
          }
        }
      }
    }

    // Switch on the next thing to read
    switch(next) {

      // msgctxt
      case 0:

        next = 0;
        if (/^ *msgctxt.*$/.test(lines[i])) {
          // empty context
          if(lines[i] == 'msgctxt ""') {
            // Case 1 next line is id
            if(/^ *msgid/.test(lines[i+1])) {
              next = 1;
            }
            // Case 2 multi line context
            else {
              context = '';
              while(/^ *".*"$/.test(lines[i+1])) {
                context += /^ *"(.*)"$/.exec(lines[i+1])[1];
                i++;
              }
              next = 1;
            }

          } else {
            context = /msgctxt "(.*)"/.exec(lines[i])[1];
            next = 1;
          }
        } else if(/^ *msgid/.test(lines[i])) {
          next = 1;
          i--;
        }

        break;
      // msgid
      case 1:
        next = 1;
        id = "";
        if (/msgid /.test(lines[i])) {
          // Empty msgid
          if (lines[i] == 'msgid ""') {
            // Case 1: next line is a "msgstr" (comment)
            if(/^ *msgstr/.test(lines[i+1])) {
              next = 2;
            }
            // Case 2: the next line(s) contain a multiline msgid
            // => read id on multiple lines
            else {
              while(/^ *".*"$/.test(lines[i+1])) {
                id += /^ *"(.*)"$/.exec(lines[i+1])[1];
                i++;
              }
              next = 3;
            }
          }
          // Not empty msgid
          // => Save it in id
          else {
            id = /msgid "(.*)"/.exec(lines[i])[1];
            next = 3;
          }
        }
        break;

      // msgstr comment
      case 2:
        while(/^".*"$/.test(lines[i+1])) {
          i++;
        }
        next = 0;
        break;

      // msgstr or msgid_plural
      case 3:
        // msgstr
        if(/^ *msgstr/.test(lines[i])) {
          msg = "";
          // Multiline (if first line is empty)
          if(lines[i] == 'msgstr ""') {
            while(/^ *".*"$/.test(lines[i+1])) {
              msg += /^ *"(.*)"$/.exec(lines[i+1])[1];
              i++;
            }
          }
          // Single line
          else {
            msg = /msgstr "(.*)"/.exec(lines[i])[1];
          }
          next = 0;
          if(manageContext) {
            if(!entries.hasOwnProperty(context)) {
              entries[context] = {};
            }
            entries[context][id] = msg;
          } else {
            entries[id] = msg;
          }

        }
        // msgid_plural
        else if(/^ *msgid_plural/.test(lines[i])) {
          id_plural = "";
          // Multiline (if first line is empty)
          if(lines[i] == 'msgid_plural ""') {
            while(/^\s*".*"$/.test(lines[i+1])) {
              id_plural += /^\s*"(.*)"$/.exec(lines[i+1])[1];
              i++;
            }
          }
          // Single line
          else {
            id_plural = /msgid_plural "(.*)"/.exec(lines[i])[1];
          }
          next = 4;
        }

        break;

      // msgstr[0]
      case 4:

        msg = "";
        // Multiline (if first line is empty)
        if (lines[i] == 'msgstr[0] ""') {
          while(/^\s*".*"$/.test(lines[i+1])){
            msg += /^\s*"(.*)"$/.exec(lines[i+1])[1];
            i++;
          }
        }
        // Single line
        else {
          msg = /msgstr\[0\] "(.*)"/.exec(lines[i])[1];
        }
        if (/msgstr\[1\]/.test(lines[i+1])) {
          pluralCount = 0;
          next = 5;
        } else {
          next = 0;
        }

        if(manageContext) {
          if(!entries.hasOwnProperty(context)) {
            entries[context] = {};
          }
          entries[context][id_plural] = [];
          entries[context][id_plural].push(msg);
        } else {
          if(!entries.hasOwnProperty(id_plural)) {
            entries[id_plural] = {};
          }
          entries[id_plural] = [];
          entries[id_plural][0] = msg;
        }

        break;
    }

    // Multi plural
    if (next > 4) {
      regex = new RegExp('msgstr\\[' + pluralCount + '\\]');
      if (regex.test(lines[i])) {
        msg_plural = "";
        // Multiline (if first line is empty)
        if (lines[i] == 'msgstr[' + pluralCount + '] ""') {
          while(/^\s*".*"$/.test(lines[i+1])){
            msg_plural += /^\s*"(.*)"$/.exec(lines[i+1])[1];
            i++;
          }
        }
        // Single line
        else {
          regex = new RegExp('msgstr\\[' + pluralCount + '\\] "(.*)"', "g");
          msg_plural = regex.exec(lines[i])[1];
        }
        if(manageContext) {
          entries[context][id_plural][pluralCount] = msg_plural;
        } else {
          entries[id_plural][pluralCount] = msg_plural;
        }
      }

      if (/msgstr\[/.test(lines[i+1])) {
        next++;
        pluralCount++;
      } else {
        next = 0;
      }
    }
  }

  return {
    options: options,
    entries: entries
  }
}
