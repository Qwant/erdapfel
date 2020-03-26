/**
    JavaScript autoComplete v1.0.4
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/JavaScript-autoComplete
    License: http://www.opensource.org/licenses/mit-license.php
*/

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
    that.sc = document.createElement('div')

    that.last_val = '';
    // that.sourcePending = null;

    that.updateSC = function(resize, next) {
    };
    addEvent(window, 'resize', that.updateSC);
    // that.offsetParent.appendChild(that.sc);

    // @HACK: cancel clicks on separator titles so they don't steal the focus from the input
    live('autocomplete_suggestion__category_title', 'mousedown', function(e) {
      e.preventDefault();
    });

    that.sourceDom = function(data, val) {
      that.items = data;
      o.updateData(data);
      o.renderItems(data, val);
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
      let innerHTML = null;
      if (data && val.length >= o.minChars) {
        o.renderItems(data, val);
      }
      if (innerHTML) {
        // that.sc.innerHTML = innerHTML;
        that.updateSC(0);
      } else {
        // that.sc.style.display = 'none';
      }
    };


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
        // that.sc.style.display = 'none';
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
      removeEvent(that, 'focus', that.focusHandler);
      removeEvent(that, 'keydown', that.keydownHandler);
      removeEvent(that, 'input', that.inputHandler);
      if (that.autocompleteAttr) {
        that.setAttribute('autocomplete', that.autocompleteAttr);
      } else {
        that.removeAttribute('autocomplete');
      }
      // that.sc.parentNode.removeChild(that.sc);
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
    o.renderItems(items);
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
