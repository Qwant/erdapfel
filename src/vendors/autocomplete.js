/**
    JavaScript autoComplete v1.0.4
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/JavaScript-autoComplete
    License: http://www.opensource.org/licenses/mit-license.php
*/

export default function autoComplete(options) {
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

  const o = {
    selector: 0,
    source: 0,
    minChars: 3,
    delay: 150,
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
    that.last_val = '';

    that.sourceDom = function(data, val) {
      o.updateData(data);
      o.renderItems(data, val);
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
      const val = that.value;
      if (data && val.length >= o.minChars) {
        o.renderItems(data, val);
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
      removeEvent(that, 'focus', that.focusHandler);
      removeEvent(that, 'input', that.inputHandler);
      that = null;
    }
  };

  this.prefetch = async function(val) {
    that.value = val;
    const source = await o.source(val);
    return source;
  };

  this.preRender = function(items = []) {
    o.renderItems(items);
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
