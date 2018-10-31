/**
    JavaScript autoComplete v1.0.4
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/JavaScript-autoComplete
    License: http://www.opensource.org/licenses/mit-license.php
*/

var autoComplete = (function(){
  // "use strict";
  function autoComplete(options){
    if (!document.querySelector) return;

    // helpers
    function hasClass(el, className){ return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className); }

    function addEvent(el, type, handler){
      if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
    }
    function removeEvent(el, type, handler){
      // if (el.removeEventListener) not working in IE11
      if (el.detachEvent) el.detachEvent('on'+type, handler); else el.removeEventListener(type, handler);
    }
    function live(elClass, event, cb, context){
      addEvent(context || document, event, function(e){
        var found, el = e.target || e.srcElement;
        while (el && !(found = hasClass(el, elClass))) el = el.parentElement;
        if (found) cb.call(el, e);
      });
    }

    var o = {
      cachePrefix: true,
      selector: 0,
      source: 0,
      minChars: 3,
      delay: 150,
      offsetLeft: 0,
      offsetTop: 1,
      cache: 1,
      menuClass: '',
      renderItem: function (item, search){},
      onSelect: function(e, term, item, items){},
      onUpdate: function(e, term, items){},
      updateData: function (items) {}
    };
    for (var k in options) { if (options.hasOwnProperty(k)) o[k] = options[k]; }

    // init
    var elems = typeof o.selector == 'object' ? [o.selector] : document.querySelectorAll(o.selector);
    for (var i=0; i<elems.length; i++) {
      var that = elems[i];

      // create suggestions container "sc"
      that.sc = document.createElement('div');
      that.sc.className = 'autocomplete_suggestions '+o.menuClass;

      that.autocompleteAttr = that.getAttribute('autocomplete');
      that.setAttribute('autocomplete', 'off');
      that.items = []
      that.cache = {};
      that.last_val = '';
      that.sourcePending = null

      that.updateSC = function(resize, next){
        var rect = that.getBoundingClientRect();
        that.sc.style.left = Math.round(rect.left + (window.pageXOffset || document.documentElement.scrollLeft) + o.offsetLeft) + 'px';
        that.sc.style.top = Math.round(rect.bottom + (window.pageYOffset || document.documentElement.scrollTop) + o.offsetTop) + 'px';
        that.sc.style.width = Math.round(rect.right - rect.left) + 'px'; // outerWidth
        if (!resize) {
          that.sc.style.display = 'block';
          if (!that.sc.maxHeight) { that.sc.maxHeight = parseInt((window.getComputedStyle ? getComputedStyle(that.sc, null) : that.sc.currentStyle).maxHeight); }
          if (!that.sc.suggestionHeight) that.sc.suggestionHeight = that.sc.querySelector('.autocomplete_suggestion').offsetHeight;
          if (that.sc.suggestionHeight)
            if (!next) that.sc.scrollTop = 0;
            else {
              var scrTop = that.sc.scrollTop, selTop = next.getBoundingClientRect().top - that.sc.getBoundingClientRect().top;
              if (selTop + that.sc.suggestionHeight - that.sc.maxHeight > 0)
                that.sc.scrollTop = selTop + that.sc.suggestionHeight + scrTop - that.sc.maxHeight;
              else if (selTop < 0)
                that.sc.scrollTop = selTop + scrTop;
            }
        }
      }
      addEvent(window, 'resize', that.updateSC);
      document.body.appendChild(that.sc);

      live('autocomplete_suggestion', 'mouseleave', function(e){
        var sel = that.sc.querySelector('.autocomplete_suggestion.selected');
        if (sel) setTimeout(function(){ sel.className = sel.className.replace('selected', ''); }, 20);
      }, that.sc);

      live('autocomplete_suggestion', 'mouseover', function(e){
        var sel = that.sc.querySelector('.autocomplete_suggestion.selected');
        if (sel) sel.className = sel.className.replace('selected', '');
        this.className += ' selected';
        var id = this.getAttribute('data-id');
        var item = that.items[0]
          that.items.forEach((i) => {
            if(i.id === id) {
              item = i
            }
          })
        o.onUpdate(e,item,that.items)
      }, that.sc);

      live('autocomplete_suggestion', 'mousedown', function(e){
        if (hasClass(this, 'autocomplete_suggestion')) { // else outside click
          var v = this.getAttribute('data-val');
          that.value = v;
          o.onSelect(e, v, this, that.items);
          that.sc.style.display = 'none';
        }
      }, that.sc);

      that.getItem = function () {
        return item[0]
      }

      that.blurHandler = function(){
        try { var over_sb = document.querySelector('.autocomplete_suggestions:hover'); } catch(e){ var over_sb = 0; }
        if (!over_sb) {
          that.last_val = that.value;
          that.sc.style.display = 'none';
          setTimeout(function(){ that.sc.style.display = 'none'; }, 350); // hide suggestions on fast input
        }
      };
      addEvent(that, 'blur', that.blurHandler);

      var suggest = function(data, queryTerm){
        if(that.sourcePending) {
          that.sourcePending.abort();
          that.sourcePending = null
        }
        that.items = data
        var val = that.value;
        if (queryTerm && data !== null) {
          // 'data' is the 'source' response based on 'queryTerm'
          // that may be differennt from 'val' (due to request latency).
          that.cache[queryTerm] = data;
        }
        if (data && data.length && val.length >= o.minChars) {
          o.updateData(data)
          var s = '';
          for (var i=0;i<data.length;i++) s += o.renderItem(data[i], val);
          that.sc.innerHTML = s;
          that.updateSC(0);
        }
        else
          that.sc.style.display = 'none';
      }

      that.keydownHandler = function(e){
        var key = window.event ? e.keyCode : e.which;
        // down (40), up (38)
        if ((key == 40 || key == 38) && that.sc.innerHTML) {
          var next, sel = that.sc.querySelector('.autocomplete_suggestion.selected');
          if (!sel) {
            next = (key == 40) ? that.sc.querySelector('.autocomplete_suggestion') : that.sc.children[that.sc.children.length - 1]; // first : last
            next.className += ' selected';
            that.value = next.getAttribute('data-val');
            that.dataId = next.getAttribute('data-id');
          } else {
            next = (key == 40) ? sel.nextElementSibling : sel.previousElementSibling;
            if (next) {
              sel.className = sel.className.replace('selected', '');
              next.className += ' selected';
              that.value = next.getAttribute('data-val');
              that.dataId = next.getAttribute('data-id');
            }
            else {
              /* back to field */
              sel.className = sel.className.replace('selected', '');
              that.dataId = that.last_id;
              that.value = that.last_val;
              next = 0;
            }
          }

          setTimeout(() => {
            that.setSelectionRange(that.value.length, that.value.length);
          })


          var item = that.items[0]
          that.items.forEach((i) => {
            if(i.id === that.dataId) {
              item = i
            }
          })
          o.onUpdate(e,item,that.items)
          that.updateSC(0, next);
          return false;
        }
        // esc
        else if (key == 27) { that.value = that.last_val; that.sc.style.display = 'none'; }
        // enter
        else if (key == 13 || key == 9) {
          var sel = that.sc.querySelector('.autocomplete_suggestion.selected');
          if (sel && that.sc.style.display != 'none') { o.onSelect(e, sel.getAttribute('data-val'), sel, that.items); setTimeout(function(){ that.sc.style.display = 'none'; }, 20); }
        }
      };
      addEvent(that, 'keydown', that.keydownHandler);

      that.keyupHandler = function(e){
        var key = window.event ? e.keyCode : e.which;
        if (!key || (key < 35 || key > 40) && key != 13 && key != 27) {
          var val = that.value;
          if (val.length >= o.minChars) {
            if (val != that.last_val) {
              that.last_val = val;
              clearTimeout(that.timer);
              if (o.cache) {
                if (val in that.cache) { suggest(that.cache[val], val); return; }
                // no requests if previous suggestions were empty
                if(o.cachePrefix) {
                  for (var i=1; i<val.length-o.minChars; i++) {
                    var part = val.slice(0, val.length-i);
                    if (part in that.cache && !that.cache[part].length) { suggest([], val); return; }
                  }
                }
              }
              that.timer = setTimeout(function(){
                that.sourcePending = o.source(val);
                that.sourcePending.then((source) => {
                  that.sourcePending = null
                  suggest(source, val);
                }).catch((e) => {
                  console.log(e) /* should be handled by a telemetry logger */
                  that.sourcePending = null
                })
              }, o.delay);
            }
          } else {
            that.last_val = val;
            that.sc.style.display = 'none';
          }
        }
      };
      addEvent(that, 'keyup', that.keyupHandler);

      that.focusHandler = function(e){
        that.last_val = '\n';
        that.keyupHandler(e)
        that.updateSC()
      };
      if (!o.minChars) addEvent(that, 'focus', that.focusHandler);

      that.listenReopen = function() {
        that.sc.style.display = 'block';
      };

      addEvent(that, 'focus', that.listenReopen);

    }

    // public destroy method
    this.destroy = function(){
      for (var i=0; i<elems.length; i++) {
        var that = elems[i];
        removeEvent(window, 'resize', that.updateSC);
        removeEvent(that, 'blur', that.blurHandler);
        removeEvent(that, 'focus', that.focusHandler);
        removeEvent(that, 'focus', that.listenReopen);
        removeEvent(that, 'keydown', that.keydownHandler);
        removeEvent(that, 'keyup', that.keyupHandler);
        if (that.autocompleteAttr)
          that.setAttribute('autocomplete', that.autocompleteAttr);
        else
          that.removeAttribute('autocomplete');
        document.body.removeChild(that.sc);
        that = null;
      }
    };
  }
  return autoComplete;
})();

(function(){
  if (typeof define === 'function' && define.amd)
    define('autoComplete', function () { return autoComplete; });
  else if (typeof module !== 'undefined' && module.exports)
    module.exports = autoComplete;
  else
    window.autoComplete = autoComplete;
})();
