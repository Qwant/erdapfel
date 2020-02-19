/**
    JavaScript autoComplete v1.0.4
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/JavaScript-autoComplete
    License: http://www.opensource.org/licenses/mit-license.php
*/

import ReactDOM from 'react-dom'

// Add Element.matches to IE11
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector;
}

export default function autoComplete(options) {
  if (!document.querySelector) {
    return;
  }

  // helpers
  function hasClass(el, className) {
    return el.classList ?
      el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
  }

  function addEvent(el, type, handler) {
    if (el.attachEvent) {
      el.attachEvent('on' + type, handler);
    } else {
      el.addEventListener(type, handler);
    }
  }

  function removeEvent(el, type, handler) {
    // if (el.removeEventListener) not working in IE11
    if (el.detachEvent) {
      el.detachEvent('on' + type, handler);
    } else {
      el.removeEventListener(type, handler);
    }
  }

  function live(elClass, event, cb, context) {
    addEvent(context || document, event, function(e) {
      let found, el = e.target || e.srcElement;
      while (el && !(found = hasClass(el, elClass))) {
        el = el.parentElement;
      }
      if (found) {
        cb.call(el, e);
      }
    });
  }

  const o = {
    selector: 0,
    source: 0,
    minChars: 3,
    delay: 150,
    offsetLeft: 0,
    offsetTop: 1,
    menuClass: '',
    // Takes as arguments: items, search
    renderItems: function() {},
    // Takes as arguments: e, term, item, items
    onSelect: function() {},
    // Takes as arguments: e, term, items
    onUpdate: function() {},
    // Takes as argument: items
    updateData: function() {},
  };
  for (const k in options) {
    if (options.hasOwnProperty(k)) {
      o[k] = options[k];
    }
  }

  // init
  const elems = typeof o.selector == 'object'
    ? [o.selector]
    : document.querySelectorAll(o.selector);
  let that;
  for (let i = 0; i < elems.length; i++) {
    that = elems[i];

    // create suggestions container "sc"
    that.sc = document.createElement('div');
    that.sc.setAttribute("id", "autocomplete-react" + o.selector);
    that.sc.className = 'autocomplete_suggestions ' + o.menuClass;

    that.autocompleteAttr = that.getAttribute('autocomplete');
    that.setAttribute('autocomplete', 'off');
    that.items = [];
    that.last_val = '';
    that.sourcePending = null;

    that.updateSC = function(resize, next) {
      const rect = that.getBoundingClientRect();
      that.sc.style.left = Math.round(that.offsetLeft + o.offsetLeft) + 'px';
      that.sc.style.top = Math.round(that.offsetTop + rect.bottom - rect.top + o.offsetTop) + 'px';
      that.sc.style.width = Math.round(rect.right - rect.left) + 'px'; // outerWidth
      if (!resize) {
        that.sc.style.display = 'block';
        if (!that.sc.maxHeight) {
          that.sc.maxHeight = parseInt((window.getComputedStyle ?
            getComputedStyle(that.sc, null) : that.sc.currentStyle).maxHeight);
        }
        if (!that.sc.suggestionHeight) {
          const suggestion = that.sc.querySelector('.autocomplete_suggestion');
          if (suggestion) {
            that.sc.suggestionHeight = suggestion.offsetHeight;
          }
        }
        if (that.sc.suggestionHeight) {
          if (!next) {
            that.sc.scrollTop = 0;
          } else {
            const scrTop = that.sc.scrollTop;
            const selTop = next.getBoundingClientRect().top - that.sc.getBoundingClientRect().top;
            if (selTop + that.sc.suggestionHeight - that.sc.maxHeight > 0) {
              that.sc.scrollTop = selTop + that.sc.suggestionHeight + scrTop - that.sc.maxHeight;
            } else if (selTop < 0) {
              that.sc.scrollTop = selTop + scrTop;
            }
          }
        }
      }
    };
    addEvent(window, 'resize', that.updateSC);
    that.offsetParent.appendChild(that.sc);

    live('autocomplete_suggestion', 'mouseleave', function() {
      const sel = that.sc.querySelector('.autocomplete_suggestion.selected');
      if (sel) {
        setTimeout(function() {
          sel.className = sel.className.replace('selected', '');
        }, 20);
      }
    }, that.sc);

    live('autocomplete_suggestion', 'mouseover', function(e) {
      const sel = that.sc.querySelector('.autocomplete_suggestion.selected');
      if (sel) {
        sel.className = sel.className.replace('selected', '');
      }
      this.className += ' selected';
      const id = this.getAttribute('data-id');
      let item = that.items[0];

      that.items.forEach(i => {
        if (i.id === id) {
          item = i;
        }
      });
      o.onUpdate(e, item, that.items);
    }, that.sc);

    live('autocomplete_suggestion', 'mousedown', function(e) {
      if (hasClass(this, 'autocomplete_suggestion')) { // else outside click
        const v = this.getAttribute('data-val');
        that.value = v;
        o.onSelect(e, v, this, that.items);
        that.sc.style.display = 'none';
      }
    }, that.sc);

    that.blurHandler = function() {
      let over_sb = null;
      try {
        over_sb = document.querySelector('.autocomplete_suggestions:hover');
      } catch (e) {
        over_sb = 0;
      }
      if (!over_sb) {
        that.last_val = that.value;
        that.sc.style.display = 'none';
        setTimeout(function() {
          // hide suggestions on fast select
          if (that !== document.activeElement) {
            that.sc.style.display = 'none';
          }
        }, 350);
      }
    };
    addEvent(that, 'blur', that.blurHandler);

    that.sourceDom = function(data, val) {
      that.items = data;
      o.updateData(data);

      ReactDOM.render(
        o.renderItems(data, val),
        document.getElementById('autocomplete-react' + o.selector)
      )

      that.updateSC(true);
    };

    const cancelObsolete = function() {
      clearTimeout(that.timer);
      if (that.sourcePending) {
        that.sourcePending.abort();
        that.sourcePending = null;
      }
    };

    const suggest = function(data) {
      cancelObsolete();
      that.items = data;
      const val = that.value;
      if (data && val.length >= o.minChars) {
        ReactDOM.render(
          o.renderItems(data, val),
          document.getElementById('autocomplete-react' + o.selector)
        )
        that.updateSC(0);
      } else {
        that.sc.style.display = 'none';
      }
    };

    const getNextSuggestion = function(el) {
      el = el.nextElementSibling;
      while (el) {
        if (el.matches('.autocomplete_suggestion')) {
          return el;
        }
        el = el.nextElementSibling;
      }
    };

    const getPreviousSuggestion = function(el) {
      el = el.previousElementSibling;
      while (el) {
        if (el.matches('.autocomplete_suggestion')) {
          return el;
        }
        el = el.previousElementSibling;
      }
    };

    that.keydownHandler = function(e) {
      const key = window.event ? e.keyCode : e.which;
      // down (40), up (38)
      if ((key == 40 || key == 38) && that.sc.innerHTML) {
        let next;
        const sel = that.sc.querySelector('.autocomplete_suggestion.selected');
        const allSuggestions = that.sc.querySelectorAll('.autocomplete_suggestion');
        if (allSuggestions === null) {
          return false;
        }
        if (!sel) {
          next = key == 40 ? allSuggestions[0] : allSuggestions[allSuggestions.length - 1];
          next.className += ' selected';
          that.value = next.getAttribute('data-val');
          that.dataId = next.getAttribute('data-id');
        } else {
          next = key == 40 ? getNextSuggestion(sel) : getPreviousSuggestion(sel);
          if (next) {
            sel.className = sel.className.replace('selected', '');
            next.className += ' selected';
            that.value = next.getAttribute('data-val');
            that.dataId = next.getAttribute('data-id');
          } else {
            /* back to field */
            sel.className = sel.className.replace('selected', '');
            that.dataId = that.last_id;
            that.value = that.last_val;
            next = 0;
          }
        }

        setTimeout(() => {
          that.setSelectionRange(that.value.length, that.value.length);
        });

        let item = that.items[0];
        that.items.forEach(i => {
          if (i.id === that.dataId) {
            item = i;
          }
        });
        o.onUpdate(e, item, that.items);
        that.updateSC(0, next);
        return false;
      } else if (key == 27) { // esc
        that.value = that.last_val;
        that.sc.style.display = 'none';
      } else if (key == 13 || key == 9) { // enter
        const sel = that.sc.querySelector('.autocomplete_suggestion.selected');
        if (sel && that.sc.style.display != 'none') {
          o.onSelect(e, sel.getAttribute('data-val'), sel, that.items);
          setTimeout(function() {
            that.sc.style.display = 'none';
          }, 20);
        }
      }
    };
    addEvent(that, 'keydown', that.keydownHandler);

    that.inputHandler = function() {
      const val = that.value;
      if (val.length >= o.minChars) {
        if (val != that.last_val) {
          cancelObsolete();
          that.last_val = val;
          that.timer = setTimeout(function() {
            // @HACK: a bug in Firefox for Android (https://bugzilla.mozilla.org/show_bug.cgi?id=1610083)
            // triggers a redundant 'input' event on the field just before it's blurred,
            // resulting in the suggest list re-appearing after a suggestion has been made.
            // So we check if the element having the focus is the field before doing anything.
            if (document.activeElement && document.activeElement !== that) {
              return;
            }
            that.sourcePending = o.source(val);
            that.sourcePending.then(source => {
              that.sourcePending = null;
              if (source !== null) {
                suggest(source);
              }
            }).catch(e => {
              console.warn(e); /* should be handled by a telemetry logger */
              that.sourcePending = null;
            });
          }, o.delay);
        }
      } else {
        that.last_val = val;
        that.sc.style.display = 'none';
      }
    };
    addEvent(that, 'input', that.inputHandler);

    that.focusHandler = function(e) {
      that.last_val = '\n';
      that.inputHandler(e);
    };
    if (!o.minChars) {
      addEvent(that, 'focus', that.focusHandler);
    }
  }

  // public destroy method
  this.destroy = function() {
    for (let i = 0; i < elems.length; i++) {
      let that = elems[i];
      removeEvent(window, 'resize', that.updateSC);
      removeEvent(that, 'blur', that.blurHandler);
      removeEvent(that, 'focus', that.focusHandler);
      removeEvent(that, 'keydown', that.keydownHandler);
      removeEvent(that, 'input', that.inputHandler);
      if (that.autocompleteAttr) {
        that.setAttribute('autocomplete', that.autocompleteAttr);
      } else {
        that.removeAttribute('autocomplete');
      }
      that.sc.parentNode.removeChild(that.sc);
      that = null;
    }
  };

  this.prefetch = async function(val) {
    that.value = val;
    const source = await o.source(val);
    if (source !== null) {
      that.sourceDom(source, val);
    }
    return source;
  };

  this.preRender = function(items = []) {
    that.items = items;
    // that.sc.innerHTML = o.renderItems(items);
    that.updateSC(true);
  };

  this.getValue = function() {
    return that.value;
  };

  this.clear = function() {
    that.value = '';
    that.last_val = '';
  };

  this.setValue = function(value) {
    that.value = value;
    that.last_val = '';
  };
}
