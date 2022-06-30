(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ 561:
/***/ (function(module, exports) {

module.exports = function configure(style, mapStyleConfig, lang) {
  return JSON.parse(style.replace(/\{locale\}/g, lang).replace('"{tileserver_base}"', mapStyleConfig.baseMapUrl).replace('"{tileserver_poi}"', mapStyleConfig.poiMapUrl).replace('{spriteserver}', mapStyleConfig.spritesUrl).replace('{fontserver}', mapStyleConfig.fontsUrl));
};

/***/ }),

/***/ 567:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/mapbox-gl-js-mock/index.js
var mapbox_gl_js_mock = __webpack_require__(550);

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(1);
var react_default = /*#__PURE__*/__webpack_require__.n(react);

// EXTERNAL MODULE: ./node_modules/react-dom/index.js
var react_dom = __webpack_require__(34);
var react_dom_default = /*#__PURE__*/__webpack_require__.n(react_dom);

// EXTERNAL MODULE: ./src/adapters/poi/idunn_poi.ts
var idunn_poi = __webpack_require__(60);
var idunn_poi_default = /*#__PURE__*/__webpack_require__.n(idunn_poi);

// EXTERNAL MODULE: ./src/libs/device.js
var device = __webpack_require__(45);

// EXTERNAL MODULE: ./src/components/PoiItem.jsx + 2 modules
var PoiItem = __webpack_require__(158);

// EXTERNAL MODULE: ./src/libs/customEvents.js
var customEvents = __webpack_require__(6);

// EXTERNAL MODULE: ./src/panel/poi/ActionButtons.jsx
var ActionButtons = __webpack_require__(289);

// EXTERNAL MODULE: ./src/libs/telemetry.ts
var telemetry = __webpack_require__(4);
var telemetry_default = /*#__PURE__*/__webpack_require__.n(telemetry);

// EXTERNAL MODULE: ./src/hooks/index.js + 5 modules
var hooks = __webpack_require__(7);

// CONCATENATED MODULE: ./src/components/PoiPopup.jsx







var PoiPopup = _ref => {
  var poi = _ref.poi;

  var _useFavorites = Object(hooks["useFavorites"])(),
      isInFavorites = _useFavorites.isInFavorites,
      removeFromFavorites = _useFavorites.removeFromFavorites,
      addToFavorites = _useFavorites.addToFavorites;

  var isDirectionActive = Object(hooks["useConfig"])('direction').enabled;

  var openDirection = () => {
    telemetry_default.a.sendPoiEvent(poi, 'itinerary');
    window.app.navigateTo('/routes/', {
      poi
    });
  };

  var onClickPhoneNumber = () => {
    var source = poi.meta && poi.meta.source;

    if (source) {
      telemetry_default.a.sendPoiEvent(poi, 'phone', telemetry_default.a.buildInteractionData({
        id: poi.id,
        source,
        template: 'single',
        zone: 'detail',
        element: 'phone'
      }));
    }
  };

  var toggleStorePoi = () => {
    var isFavorite = isInFavorites(poi);
    telemetry_default.a.sendPoiEvent(poi, 'favorite', {
      stored: !isFavorite
    });

    if (isFavorite) {
      removeFromFavorites(poi);
    } else {
      addToFavorites(poi);
    }
  };

  return /*#__PURE__*/react_default.a.createElement("div", {
    className: "poi_popup",
    onMouseEnter: () => {
      Object(customEvents["a" /* fire */])('stop_close_popup_timeout');
    },
    onMouseLeave: () => {
      Object(customEvents["a" /* fire */])('close_popup');
    }
  }, /*#__PURE__*/react_default.a.createElement("div", {
    className: "u-mb-s"
  }, /*#__PURE__*/react_default.a.createElement(PoiItem["a" /* default */], {
    poi: poi,
    withOpeningHours: true,
    withImage: true,
    inList: true
  })), /*#__PURE__*/react_default.a.createElement(ActionButtons["a" /* default */], {
    poi: poi,
    isDirectionActive: isDirectionActive,
    openDirection: openDirection,
    onClickPhoneNumber: onClickPhoneNumber,
    isPoiInFavorite: isInFavorites(poi),
    toggleStorePoi: toggleStorePoi
  }));
};

/* harmony default export */ var components_PoiPopup = (PoiPopup);
// CONCATENATED MODULE: ./src/adapters/poi_popup.js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }








var WAIT_BEFORE_DISPLAY = 350;
var WAIT_BEFORE_CLOSE = 350;

function poi_popup_PoiPopup() {
  return undefined;
}

poi_popup_PoiPopup.prototype.init = function (map) {
  this.map = map;
  this.popupHandle = null;
  this.timeOutHandler = null;
  this.activePoiId = null;
  this.closeTimeoutHandler = null;
  Object(customEvents["b" /* listen */])('open_popup', (poi, e) => {
    if (Object(device["c" /* isMobileDevice */])() || isTouchEvent(e)) {
      return;
    }

    this.createPJPopup(poi, e);
    Object(customEvents["a" /* fire */])('stop_close_popup_timeout');
  });
  Object(customEvents["b" /* listen */])('close_popup', () => this.close());
  Object(customEvents["b" /* listen */])('clean_marker', () => {
    this.close();
    this.activePoiId = null;
  });
  Object(customEvents["b" /* listen */])('stop_close_popup_timeout', () => clearTimeout(this.closeTimeoutHandler));
  Object(customEvents["b" /* listen */])('start_close_popup_timeout', () => {
    clearTimeout(this.closeTimeoutHandler);
    this.closeTimeoutHandler = setTimeout(() => {
      Object(customEvents["a" /* fire */])('close_popup');
    }, WAIT_BEFORE_CLOSE);
  });
};

poi_popup_PoiPopup.prototype.addListener = function (layer) {
  var _this = this;

  this.map.on('mouseenter', layer, e => {
    if (Object(device["c" /* isMobileDevice */])() || isTouchEvent(e)) {
      return;
    }

    this.timeOutHandler = setTimeout(() => {
      var poi = e.features[0];

      if (this.activePoiId === poi.properties.global_id) {
        return;
      }

      this.createOSMPopup(poi, e.originalEvent);
    }, WAIT_BEFORE_DISPLAY);
  });
  this.map.on('click', () => {
    this.close();
  });
  this.map.on('mouseleave', layer, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            clearTimeout(_this.timeOutHandler);
            Object(customEvents["a" /* fire */])('start_close_popup_timeout');

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
};

poi_popup_PoiPopup.prototype.createOSMPopup = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(layerPoi, event) {
    var poi;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return idunn_poi_default.a.poiApiLoad({
              id: layerPoi.properties.global_id
            }, {
              simple: true
            });

          case 2:
            poi = _context2.sent;

            if (poi) {
              this.showPopup(poi, event);
            }

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

poi_popup_PoiPopup.prototype.createPJPopup = function (poi, event) {
  if (poi) {
    this.showPopup(poi, event);
  }
};

poi_popup_PoiPopup.prototype.showPopup = function (poi, event) {
  this.close();
  var popupOptions = {
    className: 'poi_popup__container',
    closeButton: false,
    maxWidth: 'none',
    offset: 18,
    //px,
    anchor: this.getPopupAnchor(event)
  };
  this.popupHandle = new mapbox_gl_js_mock["Popup"](popupOptions).setLngLat(poi.latLon).setHTML('<div class="poi_popup__wrapper"/></div>').addTo(this.map);
  var popupWrapper = document.querySelector('.poi_popup__wrapper');

  if (popupWrapper) {
    react_dom_default.a.render( /*#__PURE__*/react_default.a.createElement(components_PoiPopup, {
      poi: poi
    }), popupWrapper);
  }
};

poi_popup_PoiPopup.prototype.getPopupAnchor = function (event) {
  var VERTICAL_OFFSET = 250;
  var HORIZONTAL_OFFSET = 300;
  var canvasWidth = window.innerWidth;
  var anchorFragments = [];

  if (event) {
    if (event.clientY > VERTICAL_OFFSET) {
      anchorFragments.push('bottom');
    } else {
      anchorFragments.push('top');
    }

    if (event.clientX < canvasWidth - HORIZONTAL_OFFSET) {
      anchorFragments.push('left');
    } else {
      anchorFragments.push('right');
    }
  } else {
    anchorFragments.push('bottom');
    anchorFragments.push('left');
  }

  return anchorFragments.join('-');
};

poi_popup_PoiPopup.prototype.close = function () {
  if (this.popupHandle) {
    Object(customEvents["a" /* fire */])('stop_close_popup_timeout');
    var popupWrapper = document.querySelector('.poi_popup__wrapper');

    if (popupWrapper) {
      react_dom_default.a.unmountComponentAtNode(popupWrapper);
    }

    this.popupHandle.remove();
    this.popupHandle = null;
  }
};
/* private */


function isTouchEvent(event) {
  if (event && event.originalEvent && event.originalEvent.sourceCapabilities) {
    return event.originalEvent.sourceCapabilities.firesTouchEvents === true;
  }

  return false;
}

/* harmony default export */ var poi_popup = (poi_popup_PoiPopup);
// CONCATENATED MODULE: ./src/mapbox/mobile_compass_control.js
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var MobileCompassControl = /*#__PURE__*/function () {
  function MobileCompassControl() {
    _classCallCheck(this, MobileCompassControl);

    this._container = document.createElement('div');
    var compassClass = 'map_control_group__button__compass--mobile';
    this._compass = this._createButton(compassClass, 'Reset North', () => {
      this._resetNorthAndTilt();
    });
    var compassIndicatorClass = 'map_control__compass__icon map_control__compass__icon--mobile';
    this._compassIndicator = this._createIcon(compassIndicatorClass);

    this._compass.appendChild(this._compassIndicator);
  }

  _createClass(MobileCompassControl, [{
    key: "onAdd",
    value: function onAdd(map) {
      this._map = map;
      this._container.className = 'map_control_group';
      this._container.textContent = '';

      this._container.appendChild(this._compass);

      var _pitchAndRotateCompassArrow = this._pitchAndRotateCompassArrow.bind(this);

      _pitchAndRotateCompassArrow();

      this._map.on('rotate', _pitchAndRotateCompassArrow);

      this._map.on('pitch', _pitchAndRotateCompassArrow);

      return this._container;
    }
  }, {
    key: "onRemove",
    value: function onRemove() {
      this._container.parentNode.removeChild(this._container);

      this._map = undefined;
    }
  }, {
    key: "_geolocate",
    value: function _geolocate() {
      navigator.geolocation.getCurrentPosition(position => {
        this._map.flyTo({
          center: [position.coords.longitude, position.coords.latitude]
        });
      }, () => undefined, {
        maximumAge: 10000
      });
    }
  }, {
    key: "_createButton",
    value: function _createButton(className, ariaLabel, fn) {
      var a = document.createElement('button');
      a.setAttribute('class', className);
      a.setAttribute('aria-label', ariaLabel);
      a.addEventListener('click', fn);

      this._container.appendChild(a);

      return a;
    }
  }, {
    key: "_createIcon",
    value: function _createIcon(className) {
      var a = document.createElement('span');
      a.setAttribute('class', className);
      return a;
    }
  }, {
    key: "_resetNorthAndTilt",
    value: function _resetNorthAndTilt() {
      this._map.easeTo({
        pitch: 0,
        bearing: 0
      });
    }
  }, {
    key: "_pitchAndRotateCompassArrow",
    value: function _pitchAndRotateCompassArrow() {
      if (this._map.getPitch() === 0 && this._map.transform.angle === 0) {
        this._compass.classList.add('compass-origin');
      } else {
        this._compass.classList.remove('compass-origin');
      }

      var scale = 1 - this._map.getPitch() / 110;
      var rotation = this._map.transform.angle * (180 / Math.PI);
      this._compassIndicator.style.transform = "scale(1, ".concat(scale, ") rotate(").concat(rotation, "deg)");
    }
  }]);

  return MobileCompassControl;
}();


// CONCATENATED MODULE: ./src/mapbox/extended_scale_control.js
function extended_scale_control_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function extended_scale_control_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function extended_scale_control_createClass(Constructor, protoProps, staticProps) { if (protoProps) extended_scale_control_defineProperties(Constructor.prototype, protoProps); if (staticProps) extended_scale_control_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }


/**
 * Override default control to pass a container
 * in constructor and register a onReady cb
 */

var ExtendedScaleControl = /*#__PURE__*/function (_ScaleControl) {
  _inherits(ExtendedScaleControl, _ScaleControl);

  var _super = _createSuper(ExtendedScaleControl);

  function ExtendedScaleControl(options, container) {
    var _this;

    extended_scale_control_classCallCheck(this, ExtendedScaleControl);

    _this = _super.call(this, options);
    _this.parentContainer = container;
    return _this;
  }

  extended_scale_control_createClass(ExtendedScaleControl, [{
    key: "onAdd",
    value: function onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-scale map_control__scale';
      this.parentContainer.appendChild(this._container);

      this._map.on('move', this._onMove);

      _get(_getPrototypeOf(ExtendedScaleControl.prototype), "_onMove", this).call(this);

      return this.parentContainer;
    }
  }]);

  return ExtendedScaleControl;
}(mapbox_gl_js_mock["ScaleControl"]);


// CONCATENATED MODULE: ./src/mapbox/extended_attribution_control.js
function extended_attribution_control_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function extended_attribution_control_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function extended_attribution_control_createClass(Constructor, protoProps, staticProps) { if (protoProps) extended_attribution_control_defineProperties(Constructor.prototype, protoProps); if (staticProps) extended_attribution_control_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function extended_attribution_control_get() { if (typeof Reflect !== "undefined" && Reflect.get) { extended_attribution_control_get = Reflect.get; } else { extended_attribution_control_get = function _get(target, property, receiver) { var base = extended_attribution_control_superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return extended_attribution_control_get.apply(this, arguments); }

function extended_attribution_control_superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = extended_attribution_control_getPrototypeOf(object); if (object === null) break; } return object; }

function extended_attribution_control_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) extended_attribution_control_setPrototypeOf(subClass, superClass); }

function extended_attribution_control_setPrototypeOf(o, p) { extended_attribution_control_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return extended_attribution_control_setPrototypeOf(o, p); }

function extended_attribution_control_createSuper(Derived) { var hasNativeReflectConstruct = extended_attribution_control_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = extended_attribution_control_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = extended_attribution_control_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return extended_attribution_control_possibleConstructorReturn(this, result); }; }

function extended_attribution_control_possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return extended_attribution_control_assertThisInitialized(self); }

function extended_attribution_control_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function extended_attribution_control_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function extended_attribution_control_getPrototypeOf(o) { extended_attribution_control_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return extended_attribution_control_getPrototypeOf(o); }


/**
 * Override default control to pass a container
 * in constructor and register a onReady cb
 */

var ExtendedAttributionControl = /*#__PURE__*/function (_AttributionControl) {
  extended_attribution_control_inherits(ExtendedAttributionControl, _AttributionControl);

  var _super = extended_attribution_control_createSuper(ExtendedAttributionControl);

  function ExtendedAttributionControl(options, container) {
    var _this;

    extended_attribution_control_classCallCheck(this, ExtendedAttributionControl);

    _this = _super.call(this, options);
    _this.parentContainer = container;
    return _this;
  }

  extended_attribution_control_createClass(ExtendedAttributionControl, [{
    key: "onAdd",
    value: function onAdd(map) {
      var container = extended_attribution_control_get(extended_attribution_control_getPrototypeOf(ExtendedAttributionControl.prototype), "onAdd", this).call(this, map);

      if (container) {
        this.parentContainer.appendChild(container);
      }

      return this.parentContainer;
    }
  }]);

  return ExtendedAttributionControl;
}(mapbox_gl_js_mock["AttributionControl"]);


// EXTERNAL MODULE: ./src/libs/geolocation.js
var geolocation = __webpack_require__(111);

// EXTERNAL MODULE: ./src/modals/GeolocationModal.jsx
var GeolocationModal = __webpack_require__(291);

// EXTERNAL MODULE: ./src/adapters/store.js
var store = __webpack_require__(36);

// EXTERNAL MODULE: ./node_modules/react-dom/server.browser.js
var server_browser = __webpack_require__(285);
var server_browser_default = /*#__PURE__*/__webpack_require__.n(server_browser);

// CONCATENATED MODULE: ./src/libs/renderStaticReact.js

/* harmony default export */ var renderStaticReact = (reactElement => server_browser_default.a.renderToStaticMarkup(reactElement));
// EXTERNAL MODULE: ./src/components/ui/icons.ts
var icons = __webpack_require__(17);

// CONCATENATED MODULE: ./src/mapbox/extended_geolocate_control.js
function extended_geolocate_control_asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function extended_geolocate_control_asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { extended_geolocate_control_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { extended_geolocate_control_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function extended_geolocate_control_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function extended_geolocate_control_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function extended_geolocate_control_createClass(Constructor, protoProps, staticProps) { if (protoProps) extended_geolocate_control_defineProperties(Constructor.prototype, protoProps); if (staticProps) extended_geolocate_control_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function extended_geolocate_control_get() { if (typeof Reflect !== "undefined" && Reflect.get) { extended_geolocate_control_get = Reflect.get; } else { extended_geolocate_control_get = function _get(target, property, receiver) { var base = extended_geolocate_control_superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return extended_geolocate_control_get.apply(this, arguments); }

function extended_geolocate_control_superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = extended_geolocate_control_getPrototypeOf(object); if (object === null) break; } return object; }

function extended_geolocate_control_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) extended_geolocate_control_setPrototypeOf(subClass, superClass); }

function extended_geolocate_control_setPrototypeOf(o, p) { extended_geolocate_control_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return extended_geolocate_control_setPrototypeOf(o, p); }

function extended_geolocate_control_createSuper(Derived) { var hasNativeReflectConstruct = extended_geolocate_control_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = extended_geolocate_control_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = extended_geolocate_control_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return extended_geolocate_control_possibleConstructorReturn(this, result); }; }

function extended_geolocate_control_possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return extended_geolocate_control_assertThisInitialized(self); }

function extended_geolocate_control_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function extended_geolocate_control_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function extended_geolocate_control_getPrototypeOf(o) { extended_geolocate_control_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return extended_geolocate_control_getPrototypeOf(o); }










/**
 * Override default GeolocateControl
 */

var extended_geolocate_control_ExtendedGeolocateControl = /*#__PURE__*/function (_GeolocateControl) {
  extended_geolocate_control_inherits(ExtendedGeolocateControl, _GeolocateControl);

  var _super = extended_geolocate_control_createSuper(ExtendedGeolocateControl);

  function ExtendedGeolocateControl(options, container) {
    var _this;

    extended_geolocate_control_classCallCheck(this, ExtendedGeolocateControl);

    _this = _super.call(this, options);
    _this._container = container;

    _this.on('trackuserlocationstart', () => {
      telemetry_default.a.addOnce(telemetry_default.a.LOCALISE_TRIGGER);
    });

    return _this;
  }

  extended_geolocate_control_createClass(ExtendedGeolocateControl, [{
    key: "onAdd",
    value: function onAdd(map) {
      this._map = map;

      this._setupUI();

      return this._container;
    }
  }, {
    key: "onReady",
    value: function onReady(cb) {
      this._onReady = cb;
    }
  }, {
    key: "trigger",
    value: function () {
      var _trigger = extended_geolocate_control_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var state;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return geolocation["b" /* getGeolocationPermission */]();

              case 2:
                state = _context.sent;

                if (!(state === geolocation["a" /* geolocationPermissions */].PROMPT && !store["c" /* get */]('has_geolocate_modal_opened_once'))) {
                  _context.next = 7;
                  break;
                }

                _context.next = 6;
                return Object(GeolocationModal["b" /* openPendingGeolocateModal */])();

              case 6:
                store["i" /* set */]('has_geolocate_modal_opened_once', true);

              case 7:
                extended_geolocate_control_get(extended_geolocate_control_getPrototypeOf(ExtendedGeolocateControl.prototype), "trigger", this).call(this);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function trigger() {
        return _trigger.apply(this, arguments);
      }

      return trigger;
    }()
  }, {
    key: "_setupUI",
    value: function _setupUI(supported) {
      var _this$_geolocateButto;

      extended_geolocate_control_get(extended_geolocate_control_getPrototypeOf(ExtendedGeolocateControl.prototype), "_setupUI", this).call(this, supported);

      if ((_this$_geolocateButto = this._geolocateButton) !== null && _this$_geolocateButto !== void 0 && _this$_geolocateButto.firstChild) {
        this._geolocateButton.firstChild.innerHTML = renderStaticReact( /*#__PURE__*/react_default.a.createElement(icons["IconGeoloc"], {
          fill: "currentColor",
          width: Object(device["c" /* isMobileDevice */])() ? 24 : 16
        }));
      }

      this._onReady();
    }
  }, {
    key: "_onError",
    value: function _onError(error) {
      geolocation["c" /* handleError */](error);

      extended_geolocate_control_get(extended_geolocate_control_getPrototypeOf(ExtendedGeolocateControl.prototype), "_onError", this).call(this, error); // MapboxGL implementation disables the button after an error,
      // but we won't the user to always have feedback with relevant links
      // so override this behavior


      this._geolocateButton.disabled = false;
    }
  }]);

  return ExtendedGeolocateControl;
}(mapbox_gl_js_mock["GeolocateControl"]);


// CONCATENATED MODULE: ./src/mapbox/extended_nav_control.js
function extended_nav_control_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function extended_nav_control_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function extended_nav_control_createClass(Constructor, protoProps, staticProps) { if (protoProps) extended_nav_control_defineProperties(Constructor.prototype, protoProps); if (staticProps) extended_nav_control_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }










var extended_nav_control_ExtendedControl = /*#__PURE__*/function () {
  function ExtendedControl() {
    extended_nav_control_classCallCheck(this, ExtendedControl);

    this._container = document.createElement('div');
    this.topButtonGroup = document.createElement('div');
    this.bottomButtonGroup = document.createElement('div'); // Store a callback to trigger when direction shortcut is clicked.
    // if no callback is registered, then the default action will be executed
    // (navigate to /routes)

    this.directionShortcutCallback = null;
    Object(customEvents["b" /* listen */])('set_direction_shortcut_callback', cb => this.directionShortcutCallback = cb);
    this._zoomInButton = this._createButton('map_control_group__button__zoom map-button--zoomIn', 'Zoom +', () => {
      telemetry_default.a.add(telemetry_default.a.MAP_ZOOM_IN);

      this._map.zoomIn();
    });
    this._zoomInButton.innerHTML = renderStaticReact( /*#__PURE__*/react_default.a.createElement(icons["IconPlus"], {
      fill: "currentColor",
      width: 16
    }));
    this._zoomOutButton = this._createButton('map_control_group__button__zoom map-button--zoomOut', 'Zoom -', () => {
      telemetry_default.a.add(telemetry_default.a.MAP_ZOOM_OUT);

      this._map.zoomOut();
    });
    this._zoomOutButton.innerHTML = renderStaticReact( /*#__PURE__*/react_default.a.createElement(icons["IconMinus"], {
      fill: "currentColor",
      width: 16
    }));
    var compassClass = 'map_control_group__button__compass';
    this._compass = this._createButton(compassClass, 'Reset North', () => {
      this._resetNorthAndTilt();
    });
    this._direction = this._createButton('direction_shortcut hidden', 'direction', () => {
      telemetry_default.a.add(telemetry_default.a.MAP_ITINERARY);
      this.directionShortcutCallback ? this.directionShortcutCallback() : window.app.navigateTo('/routes'); // default action, if no cb has been set
    });
    this._compassIndicator = this._createIcon('map_control__compass__icon');

    this._compass.appendChild(this._compassIndicator);
  }

  extended_nav_control_createClass(ExtendedControl, [{
    key: "onAdd",
    value: function onAdd(map) {
      this._map = map;
      this.topButtonGroup.className = 'map_control_group';
      this.topButtonGroup.textContent = '';
      this.bottomButtonGroup.className = 'map_control_group map_bottom_button_group mapboxgl-ctrl';
      this.bottomButtonGroup.textContent = '';
      var geolocControl = new extended_geolocate_control_ExtendedGeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showAccuracyCircle: false
      }, this.bottomButtonGroup);
      this.topButtonGroup.appendChild(this._compass);
      this.topButtonGroup.appendChild(this._direction);
      geolocControl.onReady(() => {
        this.bottomButtonGroup.appendChild(this._zoomInButton);
        this.bottomButtonGroup.appendChild(this._zoomOutButton);
      });

      this._map.addControl(geolocControl);

      var _pitchAndRotateCompassArrow = this._pitchAndRotateCompassArrow.bind(this);

      _pitchAndRotateCompassArrow();

      this._map.on('rotate', _pitchAndRotateCompassArrow);

      this._map.on('pitch', _pitchAndRotateCompassArrow);

      this.scaleAttributionContainer = document.createElement('div');
      this.scaleAttributionContainer.className = 'map_control__scale_attribute_container';

      this._container.appendChild(this.scaleAttributionContainer);

      var extendedScaleControl = new ExtendedScaleControl({
        unit: 'metric'
      }, this.scaleAttributionContainer);
      var extendedAttributionControl = new ExtendedAttributionControl({}, this.scaleAttributionContainer);

      this._container.appendChild(this.topButtonGroup);

      this._container.appendChild(this.bottomButtonGroup);

      this._container.appendChild(this.scaleAttributionContainer);

      this._map.addControl(extendedScaleControl, 'bottom-right');

      this._map.addControl(extendedAttributionControl, 'bottom-right');

      return this._container;
    }
  }, {
    key: "onRemove",
    value: function onRemove() {
      this._container.parentNode.removeChild(this._container);

      this._map = undefined;
      Object(customEvents["c" /* unListen */])('set_direction_shortcut_callback');
    }
  }, {
    key: "_createButton",
    value: function _createButton(className, ariaLabel, fn) {
      var a = document.createElement('button');
      a.setAttribute('class', className);
      a.setAttribute('aria-label', ariaLabel);
      a.setAttribute('title', ariaLabel);
      a.addEventListener('click', fn);
      return a;
    }
  }, {
    key: "_createIcon",
    value: function _createIcon(className) {
      var a = document.createElement('span');
      a.setAttribute('class', className);
      return a;
    }
  }, {
    key: "_resetNorthAndTilt",
    value: function _resetNorthAndTilt() {
      this._map.easeTo({
        pitch: 0,
        bearing: 0
      });
    }
  }, {
    key: "_pitchAndRotateCompassArrow",
    value: function _pitchAndRotateCompassArrow() {
      if (this._map.getPitch() === 0 && this._map.transform.angle === 0) {
        this._compass.classList.add('compass-origin');
      } else {
        this._compass.classList.remove('compass-origin');
      }

      var scale = 1 - this._map.getPitch() / 110;
      var rotation = this._map.transform.angle * (180 / Math.PI);
      this._compassIndicator.style.transform = "scale(1, ".concat(scale, ") rotate(").concat(rotation, "deg)");
    }
  }]);

  return ExtendedControl;
}();


// EXTERNAL MODULE: ./config/constants.yml
var constants = __webpack_require__(25);
var constants_default = /*#__PURE__*/__webpack_require__.n(constants);

// EXTERNAL MODULE: ./src/panel/layouts.js
var layouts = __webpack_require__(290);

// EXTERNAL MODULE: ./local_modules/nconf_getter/index.js
var nconf_getter = __webpack_require__(43);

// EXTERNAL MODULE: ./src/adapters/poi/poi.ts
var poi_poi = __webpack_require__(38);
var poi_default = /*#__PURE__*/__webpack_require__.n(poi_poi);

// CONCATENATED MODULE: ./src/adapters/poi/map_poi.js
function map_poi_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function map_poi_createClass(Constructor, protoProps, staticProps) { if (protoProps) map_poi_defineProperties(Constructor.prototype, protoProps); if (staticProps) map_poi_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function map_poi_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function map_poi_inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) map_poi_setPrototypeOf(subClass, superClass); }

function map_poi_setPrototypeOf(o, p) { map_poi_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return map_poi_setPrototypeOf(o, p); }

function map_poi_createSuper(Derived) { var hasNativeReflectConstruct = map_poi_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = map_poi_getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = map_poi_getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return map_poi_possibleConstructorReturn(this, result); }; }

function map_poi_possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return map_poi_assertThisInitialized(self); }

function map_poi_assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function map_poi_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function map_poi_getPrototypeOf(o) { map_poi_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return map_poi_getPrototypeOf(o); }




var map_poi_MapPoi = /*#__PURE__*/function (_Poi) {
  map_poi_inherits(MapPoi, _Poi);

  var _super = map_poi_createSuper(MapPoi);

  function MapPoi(feature) {
    map_poi_classCallCheck(this, MapPoi);

    var _feature$properties = feature.properties,
        global_id = _feature$properties.global_id,
        className = _feature$properties['class'],
        subClassName = _feature$properties.subclass,
        name = _feature$properties.name;
    var ll = mapbox_gl_js_mock["LngLat"].convert(feature.geometry.coordinates);
    return _super.call(this, global_id || feature.id, name, poi_poi["POI_TYPE"], ll, className, subClassName);
  }

  return map_poi_createClass(MapPoi);
}(poi_default.a);


// EXTERNAL MODULE: ./local_modules/mapbox_style_configure/index.js
var mapbox_style_configure = __webpack_require__(561);
var mapbox_style_configure_default = /*#__PURE__*/__webpack_require__.n(mapbox_style_configure);

// EXTERNAL MODULE: ./local_modules/uri/index.js
var uri = __webpack_require__(319);
var uri_default = /*#__PURE__*/__webpack_require__.n(uri);

// EXTERNAL MODULE: ./node_modules/@qwant/qwant-basic-gl-style/style.json
var style = __webpack_require__(562);

// CONCATENATED MODULE: ./src/adapters/scene_config.js




var mapStyleConfig = nconf_getter["default"].get().mapStyle;
var baseUrl = nconf_getter["default"].get().system.baseUrl;

function sceneConfig() {
  return Object.assign(mapStyleConfig, {
    spritesUrl: uri_default.a.toAbsoluteUrl(location.origin, baseUrl, mapStyleConfig.spritesUrl),
    fontsUrl: uri_default.a.toAbsoluteUrl(location.origin, baseUrl, mapStyleConfig.fontsUrl)
  });
}

function getStyle() {
  return mapbox_style_configure_default()(JSON.stringify(style), sceneConfig(), window.getBaseLang().code);
}
// EXTERNAL MODULE: ./src/libs/route_utils.js
var route_utils = __webpack_require__(39);

// EXTERNAL MODULE: ./src/panel/direction/VehicleIcon.jsx
var VehicleIcon = __webpack_require__(100);

// CONCATENATED MODULE: ./src/panel/direction/RouteLabel.jsx



var VEHICLES = {
  TRAIN: 'train',
  SUBWAY: 'metro',
  BUS_CITY: 'bus',
  TRAM: 'tram'
};

var PublicTransportIcon = _ref => {
  var mode = _ref.mode;
  return /*#__PURE__*/react_default.a.createElement("div", {
    className: "publicTransportLabelItem roadmapIcon roadmapIcon--".concat(VEHICLES[mode])
  });
};

var PublicTransportStepIcons = _ref2 => {
  var route = _ref2.route;
  var nonWalkLegs = route.legs.filter(leg => leg.mode !== 'WALK');

  if (nonWalkLegs.length <= 3) {
    return /*#__PURE__*/react_default.a.createElement("div", null, nonWalkLegs.map((leg, index) => /*#__PURE__*/react_default.a.createElement(PublicTransportIcon, {
      key: index,
      mode: leg.mode
    })));
  }

  return /*#__PURE__*/react_default.a.createElement("div", null, /*#__PURE__*/react_default.a.createElement(PublicTransportIcon, {
    mode: nonWalkLegs[0].mode
  }), /*#__PURE__*/react_default.a.createElement("div", {
    className: "publicTransportLabelItem roadmapIcon u-text--caption roadmapIcon--inbetween"
  }, /*#__PURE__*/react_default.a.createElement("div", null, "+", nonWalkLegs.length - 2)), /*#__PURE__*/react_default.a.createElement(PublicTransportIcon, {
    mode: nonWalkLegs[nonWalkLegs.length - 1].mode
  }));
};

var RouteLabel = _ref3 => {
  var route = _ref3.route,
      vehicle = _ref3.vehicle,
      anchor = _ref3.anchor;
  var isPublicTransport = vehicle === 'publicTransport';
  return /*#__PURE__*/react_default.a.createElement("div", {
    "data-id": route.id,
    className: "routeLabel routeLabel--".concat(anchor, " routeLabel--").concat(vehicle)
  }, isPublicTransport ? /*#__PURE__*/react_default.a.createElement(PublicTransportStepIcons, {
    route: route
  }) : /*#__PURE__*/react_default.a.createElement("div", {
    className: "routeLabel-vehicleIcon"
  }, /*#__PURE__*/react_default.a.createElement(VehicleIcon["a" /* default */], {
    vehicle: vehicle,
    fill: "currentColor",
    width: 24
  })), /*#__PURE__*/react_default.a.createElement("div", null, /*#__PURE__*/react_default.a.createElement("div", {
    className: "routeLabel-duration"
  }, Object(route_utils["b" /* formatDuration */])(route.duration)), !isPublicTransport && /*#__PURE__*/react_default.a.createElement("div", {
    className: "routeLabel-distance"
  }, Object(route_utils["a" /* formatDistance */])(route.distance))));
};

/* harmony default export */ var direction_RouteLabel = (RouteLabel);
// EXTERNAL MODULE: ./node_modules/@turf/bbox/dist/es/index.js
var es = __webpack_require__(563);

// EXTERNAL MODULE: ./src/libs/geojson.js
var geojson = __webpack_require__(232);

// EXTERNAL MODULE: ./src/adapters/poi/latlon_poi.js
var latlon_poi = __webpack_require__(154);

// EXTERNAL MODULE: ./node_modules/color/index.js
var color = __webpack_require__(110);
var color_default = /*#__PURE__*/__webpack_require__.n(color);

// EXTERNAL MODULE: ./src/libs/colors.js
var colors = __webpack_require__(33);

// CONCATENATED MODULE: ./src/adapters/route_styles.js
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var darkenColor = hex => color_default()(hex).mix(color_default()('black'), 0.33).hex();

var safeHexColor = hex => hex.charAt(0) === '#' ? hex : "#".concat(hex);

function prepareRouteColor(feature) {
  var _feature$properties;

  var lineColor = (_feature$properties = feature.properties) === null || _feature$properties === void 0 ? void 0 : _feature$properties.lineColor;
  return _objectSpread(_objectSpread({}, feature), {}, {
    properties: _objectSpread(_objectSpread({}, feature.properties), {}, {
      lineColor: lineColor ? safeHexColor(lineColor) : colors["ACTION_BLUE_SEMI_LIGHTNESS"],
      outlineColor: lineColor ? darkenColor(safeHexColor(lineColor)) : colors["ACTION_BLUE_DARK"]
    })
  });
}

function getColorExpression(isActive, isOutline) {
  if (isActive) {
    return isOutline ? ['get', 'outlineColor'] : ['get', 'lineColor'];
  }

  return isOutline ? colors["GREY_GREY"] : colors["GREY_SEMI_LIGHTNESS"];
}

function getRouteStyle(vehicle, isActive, isOutline) {
  if (vehicle === 'walking') {
    return {
      type: 'symbol',
      layout: {
        'icon-image': isActive ? 'walking_bullet_active' : 'walking_bullet_inactive',
        'symbol-placement': 'line',
        'symbol-spacing': 12,
        'icon-ignore-placement': true,
        'icon-allow-overlap': true,
        'symbol-avoid-edges': true
      }
    };
  }

  return {
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
      visibility: 'visible'
    },
    paint: {
      'line-color': getColorExpression(isActive, isOutline),
      'line-color-transition': {
        duration: 0
      },
      'line-width': isOutline ? 7 : 5
    }
  };
}
function setActiveRouteStyle(map, layerId, vehicle, isActive, isOutline) {
  if (vehicle === 'walking') {
    map.setLayoutProperty(layerId, 'icon-image', isActive ? 'walking_bullet_active' : 'walking_bullet_inactive');
  } else {
    map.setPaintProperty(layerId, 'line-color', getColorExpression(isActive, isOutline));
  }
}
// EXTERNAL MODULE: ./src/adapters/error.js
var adapters_error = __webpack_require__(27);

// EXTERNAL MODULE: ./node_modules/alt-route-labeller/index.js + 6 modules
var alt_route_labeller = __webpack_require__(565);

// CONCATENATED MODULE: ./src/adapters/scene_direction.js
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function scene_direction_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function scene_direction_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function scene_direction_createClass(Constructor, protoProps, staticProps) { if (protoProps) scene_direction_defineProperties(Constructor.prototype, protoProps); if (staticProps) scene_direction_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function scene_direction_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function scene_direction_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? scene_direction_ownKeys(Object(source), !0).forEach(function (key) { scene_direction_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : scene_direction_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function scene_direction_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

















var scene_direction_createMarker = function createMarker(lngLat) {
  var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var element = document.createElement('div');
  element.className = className;
  return new mapbox_gl_js_mock["Marker"](scene_direction_objectSpread(scene_direction_objectSpread({}, options), {}, {
    element
  })).setLngLat(lngLat);
};

var createRouteLabel = (route, vehicle, _ref) => {
  var lngLat = _ref.lngLat,
      anchor = _ref.anchor;
  var element = document.createElement('div');
  element.innerHTML = renderStaticReact( /*#__PURE__*/react_default.a.createElement(direction_RouteLabel, {
    route: route,
    vehicle: vehicle,
    anchor: anchor
  }));
  element.className = 'routeLabel-marker';

  element.onclick = () => {
    Object(customEvents["a" /* fire */])('select_road_map', route.id);
  };

  return new mapbox_gl_js_mock["Marker"]({
    element,
    anchor
  }).setLngLat(lngLat);
};

var getLabelsBbbox = (labelPositions, routesBbox) => {
  var smallScreen = Object(device["c" /* isMobileDevice */])();
  var shift = {
    latShift: (routesBbox.getNorth() - routesBbox.getSouth()) / (smallScreen ? 5 : 10),
    lngShift: (routesBbox.getEast() - routesBbox.getWest()) / (smallScreen ? 3 : 10)
  };
  var labelsBbbox = new mapbox_gl_js_mock["LngLatBounds"]();
  labelPositions.map(shiftLabelPosition(shift)).forEach(labelPosition => {
    labelsBbbox.extend(labelPosition);
  });
  return labelsBbbox;
};

var shiftLabelPosition = _ref2 => {
  var lngShift = _ref2.lngShift,
      latShift = _ref2.latShift;
  return _ref3 => {
    var lngLat = _ref3.lngLat,
        anchor = _ref3.anchor;

    var _lngLat = _slicedToArray(lngLat, 2),
        lng = _lngLat[0],
        lat = _lngLat[1];

    if (anchor === 'top') {
      lat -= latShift;
    } else if (anchor === 'bottom') {
      lat += latShift;
    } else if (anchor === 'left') {
      lng += lngShift;
    } else if (anchor === 'right') {
      lng -= lngShift;
    }

    return [lng, lat];
  };
};

var scene_direction_SceneDirection = /*#__PURE__*/function () {
  function SceneDirection(map) {
    scene_direction_classCallCheck(this, SceneDirection);

    scene_direction_defineProperty(this, "setOrigin", poi => {
      var originMarker = scene_direction_createMarker(poi.latLon, 'itinerary_marker_origin', {
        draggable: !Object(device["c" /* isMobileDevice */])()
      }).addTo(this.map).on('dragend', event => {
        this.refreshDirection('origin', event.target.getLngLat());
      });
      this.routeMarkers.push(originMarker);
    });

    scene_direction_defineProperty(this, "setDestination", poi => {
      var destinationMarker = scene_direction_createMarker(poi.latLon, 'itinerary_marker_destination', {
        draggable: !Object(device["c" /* isMobileDevice */])(),
        anchor: 'bottom'
      }).addTo(this.map).on('dragend', event => {
        this.refreshDirection('destination', event.target.getLngLat());
      });
      this.routeMarkers.push(destinationMarker);
    });

    this.map = map;
    this.routes = [];
    this.routeMarkers = [];
    this.routeLabels = [];
    this.fullBbox = null;
    this.mapFeaturesByRoute = {};
    var iconsBaseUrl = nconf_getter["default"].get().system.baseUrl + 'statics/images/direction_icons';
    this.addMapImage("".concat(iconsBaseUrl, "/walking_bullet_active.png"), 'walking_bullet_active', {
      pixelRatio: 4
    });
    this.addMapImage("".concat(iconsBaseUrl, "/walking_bullet_inactive.png"), 'walking_bullet_inactive', {
      pixelRatio: 4
    });
    Object(customEvents["b" /* listen */])('set_routes', _ref4 => {
      var routes = _ref4.routes,
          vehicle = _ref4.vehicle,
          _ref4$activeRouteId = _ref4.activeRouteId,
          activeRouteId = _ref4$activeRouteId === void 0 ? 0 : _ref4$activeRouteId;
      this.reset();
      this.routes = routes;
      this.vehicle = vehicle;
      this.displayRoutes(activeRouteId);
    });
    Object(customEvents["b" /* listen */])('set_main_route', _ref5 => {
      var routeId = _ref5.routeId,
          fitView = _ref5.fitView;
      this.setMainRoute(routeId, fitView);
    });
    Object(customEvents["b" /* listen */])('clean_routes', () => {
      this.reset();
    });
    Object(customEvents["b" /* listen */])('zoom_step', step => {
      Object(customEvents["a" /* fire */])('fit_map', this.computeBBox(step));
    });
    Object(customEvents["b" /* listen */])('highlight_step', step => {
      this.highlightStep(step);
    });
    Object(customEvents["b" /* listen */])('unhighlight_step', step => {
      this.unhighlightStep(step);
    });
    Object(customEvents["b" /* listen */])('set_origin', poi => {
      this.setOrigin(poi);
    });
    Object(customEvents["b" /* listen */])('set_destination', poi => {
      this.setDestination(poi);
    });
  }

  scene_direction_createClass(SceneDirection, [{
    key: "addMarkerSteps",
    value: function addMarkerSteps(route) {
      if (this.vehicle !== 'walking' && this.vehicle !== 'publicTransport') {
        Object(route_utils["c" /* getAllSteps */])(route).forEach((step, idx) => {
          var stepMarker = scene_direction_createMarker(step.maneuver.location, 'itinerary_marker_step');
          stepMarker.getElement().id = 'itinerary_marker_step_' + idx;
          this.routeMarkers.push(stepMarker.addTo(this.map));
        });
      }

      if (this.vehicle === 'publicTransport') {
        Object(route_utils["d" /* getAllStops */])(route).forEach((stop, idx) => {
          var stopMarker = scene_direction_createMarker(stop.location, 'itinerary_marker_step');
          stopMarker.getElement().id = 'itinerary_marker_stop_' + idx;
          stopMarker.getElement().title = stop.name;
          this.routeMarkers.push(stopMarker.addTo(this.map));
        });
      }
    }
  }, {
    key: "setMainRoute",
    value: function setMainRoute(routeId, fitView) {
      var mainRoute = null;

      if (this.routes.length === 0) {
        return;
      }

      this.routes.forEach(route => {
        var isActive = route.id === routeId;

        if (isActive) {
          mainRoute = route;
        }

        this.mapFeaturesByRoute[route.id].forEach(_ref6 => {
          var layerId = _ref6.layerId,
              outlineLayerId = _ref6.outlineLayerId,
              vehicle = _ref6.vehicle;
          setActiveRouteStyle(this.map, layerId, vehicle, isActive, false);

          if (outlineLayerId) {
            setActiveRouteStyle(this.map, outlineLayerId, vehicle, isActive, true);
          }

          if (isActive) {
            if (outlineLayerId) {
              this.map.moveLayer(outlineLayerId, constants["map"].routes_layer);
            }

            this.map.moveLayer(layerId, constants["map"].routes_layer);
          }
        });
      });
      this.updateMarkers(mainRoute);
      this.updateRouteLabels(mainRoute);

      if (fitView && this.fullBbox) {
        Object(customEvents["a" /* fire */])('fit_map', this.fullBbox);
      }
    }
  }, {
    key: "updateMarkers",
    value: function updateMarkers(mainRoute) {
      if (!mainRoute) {
        return;
      }

      this.routeMarkers.forEach(marker => {
        marker.remove();
      });
      this.routeMarkers = [];
      this.addMarkerSteps(mainRoute);

      var _originDestinationCoo = Object(route_utils["g" /* originDestinationCoords */])(mainRoute),
          origin = _originDestinationCoo.origin,
          destination = _originDestinationCoo.destination;

      this.setOrigin({
        latLon: {
          lng: origin[0],
          lat: origin[1]
        }
      });
      this.setDestination({
        latLon: {
          lng: destination[0],
          lat: destination[1]
        }
      });
    }
  }, {
    key: "displayRoutes",
    value: function displayRoutes(activeRouteId) {
      if (this.routes && this.routes.length > 0) {
        // route lines
        this.mapFeaturesByRoute = {};
        this.routes.forEach(route => {
          this.mapFeaturesByRoute[route.id] = this.addRouteFeatures(route, route.id === activeRouteId);
        }); // route labels

        var labelPositions = Object(alt_route_labeller["a" /* getLabelPositions */])(this.routes.map(route => route.geometry));
        this.routeLabels = labelPositions.map((_ref7, index) => {
          var lngLat = _ref7.lngLat,
              anchor = _ref7.anchor;
          return createRouteLabel(this.routes[index], this.vehicle, {
            lngLat,
            anchor
          }).addTo(this.map);
        }); // compute and store the best bbox

        var routesBbox = new mapbox_gl_js_mock["LngLatBounds"]();
        this.routes.forEach(route => {
          routesBbox.extend(this.computeBBox(route));
        });
        this.fullBbox = routesBbox.extend(getLabelsBbbox(labelPositions, routesBbox));
        this.setMainRoute(activeRouteId, true);
      }
    }
  }, {
    key: "updateRouteLabels",
    value: function updateRouteLabels(_ref8) {
      var activeRouteId = _ref8.id;

      // @IE11: array spread to convert NodeList to an array
      _toConsumableArray(document.querySelectorAll('.routeLabel')).forEach(routeLabel => {
        if (routeLabel.dataset.id === activeRouteId.toString()) {
          routeLabel.classList.add('active');
        } else {
          routeLabel.classList.remove('active');
        }
      });
    }
  }, {
    key: "refreshDirection",
    value: function refreshDirection(type, lngLat) {
      var newPoint = new latlon_poi["a" /* default */](lngLat);
      Object(customEvents["a" /* fire */])('change_direction_point', type, '', newPoint);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.routes.forEach(route => {
        this.mapFeaturesByRoute[route.id].forEach(_ref9 => {
          var outlineLayerId = _ref9.outlineLayerId,
              layerId = _ref9.layerId,
              sourceId = _ref9.sourceId;

          if (outlineLayerId) {
            this.map.removeLayer(outlineLayerId);
          }

          this.map.removeLayer(layerId);
          this.map.removeSource(sourceId);
        });
      });
      this.routes = [];
      this.routeMarkers.concat(this.routeLabels).forEach(marker => {
        marker.remove();
      });
      this.routeMarkers = [];
      this.routeLabels = [];
      this.fullBbox = null;
    }
  }, {
    key: "getDataSources",
    value: function getDataSources(route) {
      var featureCollection = Object(geojson["b" /* normalizeToFeatureCollection */])(route.geometry);
      var sources = [];
      var walkFeatures = [],
          nonWalkFeatures = [];
      featureCollection.features.forEach(feature => {
        if (this.vehicle === 'walking' || this.vehicle === 'publicTransport' && feature.properties.mode === 'WALK') {
          walkFeatures.push(feature);
        } else {
          nonWalkFeatures.push(prepareRouteColor(feature));
        }
      });

      if (walkFeatures.length > 0) {
        sources.push({
          vehicle: 'walking',
          data: {
            type: 'FeatureCollection',
            features: walkFeatures
          }
        });
      }

      if (nonWalkFeatures.length > 0) {
        sources.push({
          vehicle: this.vehicle,
          data: {
            type: 'FeatureCollection',
            features: nonWalkFeatures
          }
        });
      }

      return sources;
    }
  }, {
    key: "addRouteFeatures",
    value: function addRouteFeatures(route, isActive) {
      var sources = this.getDataSources(route);
      return sources.map((source, idx) => {
        var sourceId = "source_".concat(route.id, "_").concat(idx);
        this.map.addSource(sourceId, {
          type: 'geojson',
          data: source.data
        });
        var layerId = "route_".concat(route.id, "_").concat(idx);

        var layerStyle = scene_direction_objectSpread(scene_direction_objectSpread({}, getRouteStyle(source.vehicle, isActive, false)), {}, {
          id: layerId,
          source: sourceId
        });

        var outlineLayerId;

        if (source.vehicle !== 'walking') {
          outlineLayerId = layerId + '_outline';

          var outlineLayerStyle = scene_direction_objectSpread(scene_direction_objectSpread({}, getRouteStyle(source.vehicle, isActive, true)), {}, {
            id: layerId + '_outline',
            source: sourceId
          });

          this.map.addLayer(outlineLayerStyle, constants["map"].routes_layer);
        }

        this.map.addLayer(layerStyle, constants["map"].routes_layer).on('click', layerId, () => {
          Object(customEvents["a" /* fire */])('select_road_map', route.id);
        }).on('mouseenter', layerId, () => {
          this.map.getCanvas().style.cursor = 'pointer';
        }).on('mouseleave', layerId, () => {
          this.map.getCanvas().style.cursor = '';
        });
        return {
          sourceId,
          layerId,
          outlineLayerId,
          vehicle: source.vehicle
        };
      });
    }
  }, {
    key: "computeBBox",
    value: function computeBBox(_ref10) {
      var geometry = _ref10.geometry;

      var _bbox = Object(es["a" /* default */])(geometry),
          _bbox2 = _slicedToArray(_bbox, 4),
          minX = _bbox2[0],
          minY = _bbox2[1],
          maxX = _bbox2[2],
          maxY = _bbox2[3];

      return new mapbox_gl_js_mock["LngLatBounds"]([minX, minY], [maxX, maxY]);
    }
  }, {
    key: "highlightStep",
    value: function highlightStep(step) {
      var marker = document.querySelector('#itinerary_marker_step_' + step);

      if (marker) {
        marker.classList.add('itinerary_marker_step--highlighted');
      }
    }
  }, {
    key: "unhighlightStep",
    value: function unhighlightStep(step) {
      var marker = document.querySelector('#itinerary_marker_step_' + step);

      if (marker) {
        marker.classList.remove('itinerary_marker_step--highlighted');
      }
    }
  }, {
    key: "addMapImage",
    value: function addMapImage(url, name) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      this.map.loadImage(url, (error, image) => {
        if (error) {
          adapters_error["default"].sendOnce('scene', 'initMapBox', "Failed to load image at ".concat(url), error);
          return;
        }

        this.map.addImage(name, image, options);
      });
    }
  }]);

  return SceneDirection;
}();


// EXTERNAL MODULE: ./src/libs/pois.js
var libs_pois = __webpack_require__(19);

// CONCATENATED MODULE: ./src/adapters/pois_styles.js

var getFilteredPoisPinStyle = () => ({
  type: 'symbol',
  layout: {
    'icon-image': ['concat', 'pin-', ['get', 'iconName']],
    'icon-allow-overlap': true,
    'icon-ignore-placement': false,
    'icon-padding': 0,
    'icon-anchor': 'bottom'
  },
  paint: {
    'icon-opacity': ['case', ['==', ['feature-state', 'selected'], true], 0, ['==', ['feature-state', 'hovered'], true], 0, 1]
  }
});
var getFilteredPoisLabelStyle = () => ({
  type: 'symbol',
  layout: {
    'text-font': ['Noto Sans Bold'],
    'text-size': 10,
    'text-field': ['get', 'name'],
    'text-allow-overlap': false,
    'text-ignore-placement': false,
    'text-optional': true,
    'text-variable-anchor': ['top', 'bottom-left', 'bottom-right'],
    'text-offset': [1.5, 0.5],
    'text-justify': 'auto'
  },
  paint: {
    'text-color': ['case', ['==', ['feature-state', 'selected'], true], colors["RED_DARKER"], colors["GREY_BLACK"]],
    'text-halo-color': 'white',
    'text-halo-width': 1,
    'text-translate': [0, -2]
  }
});
var setPoiHoverStyle = (map, poiLayer) => {
  if (!map.getPaintProperty) {
    // @MAPBOX: This method isn't implemented by the Mapbox-GL mock
    return;
  }

  var textColorProperty = map.getPaintProperty(poiLayer, 'text-color');
  map.setPaintProperty(poiLayer, 'text-color', ['case', ['to-boolean', ['feature-state', 'hover']], colors["ACTION_BLUE_BASE"], textColorProperty], {
    validate: false
  });
};
// EXTERNAL MODULE: ./src/adapters/icon_manager.ts
var icon_manager = __webpack_require__(129);
var icon_manager_default = /*#__PURE__*/__webpack_require__.n(icon_manager);

// CONCATENATED MODULE: ./src/adapters/scene_category.js
function scene_category_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function scene_category_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? scene_category_ownKeys(Object(source), !0).forEach(function (key) { scene_category_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : scene_category_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function scene_category_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function scene_category_createClass(Constructor, protoProps, staticProps) { if (protoProps) scene_category_defineProperties(Constructor.prototype, protoProps); if (staticProps) scene_category_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function scene_category_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function scene_category_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }












var scene_category_mapStyleConfig = nconf_getter["default"].get().mapStyle;

var poisToGeoJSON = pois => {
  return {
    type: 'FeatureCollection',
    features: pois.map(poi => {
      var poiFeature = Object(geojson["c" /* poiToGeoJSON */])(poi);
      poiFeature.properties.iconName = icon_manager_default.a.get(poi).iconClass;
      return poiFeature;
    })
  };
};

var scene_category_SceneCategory = /*#__PURE__*/scene_category_createClass(function SceneCategory(map) {
  var _this = this;

  scene_category_classCallCheck(this, SceneCategory);

  scene_category_defineProperty(this, "initActiveStateMarkers", () => {
    this.hoveredPoi = null;
    this.hoveredMarker = new mapbox_gl_js_mock["Marker"]({
      element: Object(icon_manager["createPinIcon"])({
        disablePointerEvents: true,
        className: 'marker--category'
      }),
      anchor: 'bottom'
    });
    this.selectedPoi = null;
    this.selectedMarker = new mapbox_gl_js_mock["Marker"]({
      element: Object(icon_manager["createPinIcon"])({
        className: 'marker--category'
      }),
      anchor: 'bottom'
    });
  });

  scene_category_defineProperty(this, "initDynamicPoiLayers", () => {
    // Declare a new image in MapBox-GL rasters so it can be used in the layer style
    Object(icon_manager["createMapGLIcon"])('./statics/images/map/pin_map_dot.svg', 50, 60).then(imageData => {
      this.map.addImage('pin_with_dot', imageData);
    });
    this.map.addSource(this.sourceName, {
      type: 'geojson',
      data: geojson["a" /* emptyFeatureCollection */],
      // tells MapBox-GL to use this property as internal feature identifier
      promoteId: 'id'
    });

    if (scene_category_mapStyleConfig.showNamesWithPins) {
      var labelLayerId = "".concat(this.sourceName, "_labels");
      this.map.addLayer(scene_category_objectSpread(scene_category_objectSpread({}, getFilteredPoisLabelStyle()), {}, {
        source: this.sourceName,
        id: labelLayerId
      }));
      this.layers.push(labelLayerId);
    }

    var pinLayerId = "".concat(this.sourceName, "_pins");
    this.map.addLayer(scene_category_objectSpread(scene_category_objectSpread({}, getFilteredPoisPinStyle()), {}, {
      source: this.sourceName,
      id: pinLayerId
    }));
    this.layers.push(pinLayerId);
    this.layers.forEach(layerName => {
      this.map.on('click', layerName, this.handleLayerMarkerClick);

      if (!Object(device["c" /* isMobileDevice */])()) {
        this.map.on('mouseover', layerName, this.handleLayerMarkerMouseOver);
        this.map.on('mouseleave', layerName, this.handleLayerMarkerMouseLeave);
      }
    });
  });

  scene_category_defineProperty(this, "getPointedPoi", mapMouseEvent => {
    var feature = mapMouseEvent.features[0];
    return feature && this.pois.find(p => p.id === feature.id);
  });

  scene_category_defineProperty(this, "selectPoi", _ref => {
    var poi = _ref.poi,
        poiFilters = _ref.poiFilters,
        pois = _ref.pois;

    if (poi.meta && poi.meta.source) {
      telemetry_default.a.sendPoiEvent(poi, 'open', telemetry_default.a.buildInteractionData({
        id: poi.id,
        source: poi.meta.source,
        template: 'multiple',
        zone: 'list',
        element: 'item',
        category: poiFilters.category
      }));
    }

    window.app.navigateTo("/place/".concat(Object(libs_pois["toUrl"])(poi)), {
      poi,
      poiFilters,
      pois,
      centerMap: true
    });
    this.selectPoiMarker(poi);
  });

  scene_category_defineProperty(this, "handleLayerMarkerClick", e => {
    e.originalEvent.stopPropagation();
    var poi = this.getPointedPoi(e);
    this.selectPoi({
      poi,
      pois: this.pois,
      poiFilters: this.poiFilters
    });
  });

  scene_category_defineProperty(this, "handleLayerMarkerMouseOver", e => {
    var _this$selectedPoi;

    this.map.getCanvas().style.cursor = 'pointer';
    var poi = this.getPointedPoi(e);

    if (((_this$selectedPoi = this.selectedPoi) === null || _this$selectedPoi === void 0 ? void 0 : _this$selectedPoi.id) !== poi.id) {
      this.highlightPoiMarker(poi, true);
      Object(customEvents["a" /* fire */])('open_popup', poi, e.originalEvent);
    }
  });

  scene_category_defineProperty(this, "handleLayerMarkerMouseLeave", () => {
    this.map.getCanvas().style.cursor = '';
    this.highlightPoiMarker(this.hoveredPoi, false); // delay the popup closure so it can be hovered

    Object(customEvents["a" /* fire */])('start_close_popup_timeout');
  });

  scene_category_defineProperty(this, "addCategoryMarkers", function () {
    var pois = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var poiFilters = arguments.length > 1 ? arguments[1] : undefined;
    Object(customEvents["a" /* fire */])('close_popup');
    _this.pois = pois;
    _this.poiFilters = poiFilters;

    _this.setOsmPoisVisibility(false);

    _this.map.getSource(_this.sourceName).setData(poisToGeoJSON(pois));

    _this.layers.forEach(layerName => {
      _this.map.setLayoutProperty(layerName, 'visibility', 'visible');
    });
  });

  scene_category_defineProperty(this, "removeCategoryMarkers", () => {
    Object(customEvents["a" /* fire */])('close_popup');
    this.selectPoiMarker(null);
    this.highlightPoiMarker(this.hoveredPoi, false);
    this.layers.forEach(layerName => {
      this.map.setLayoutProperty(layerName, 'visibility', 'none');
    });
    this.setOsmPoisVisibility(true);
  });

  scene_category_defineProperty(this, "setOsmPoisVisibility", displayed => {
    constants_default.a.map.pois_layers.map(poi => {
      this.map.setLayoutProperty(poi, 'visibility', displayed ? 'visible' : 'none');
    });
  });

  scene_category_defineProperty(this, "setPoiFeatureState", (id, state) => {
    this.map.setFeatureState({
      id,
      source: this.sourceName
    }, state);
  });

  scene_category_defineProperty(this, "highlightPoiMarker", (poi, highlight) => {
    if (this.hoveredPoi) {
      this.setPoiFeatureState(this.hoveredPoi.id, {
        hovered: false
      });
    }

    if (highlight) {
      this.hoveredPoi = poi;
      this.hoveredMarker.setLngLat(poi.latLon).addTo(this.map);
      this.setPoiFeatureState(this.hoveredPoi.id, {
        hovered: true
      });
    } else {
      this.hoveredMarker.remove();
      this.hoveredPoi = null;
    }
  });

  scene_category_defineProperty(this, "selectPoiMarker", poi => {
    if (this.selectedPoi === poi) {
      return;
    }

    if (this.selectedPoi) {
      this.setPoiFeatureState(this.selectedPoi.id, {
        selected: false
      });
    }

    if (poi) {
      this.selectedPoi = poi;
      this.selectedMarker.setLngLat(poi.latLon).addTo(this.map);
      this.setPoiFeatureState(this.selectedPoi.id, {
        selected: true
      });
    } else {
      this.selectedMarker.remove();
      this.selectedPoi = null;
    }
  });

  this.map = map;
  this.sourceName = 'poi-filtered';
  this.layers = [];
  this.initActiveStateMarkers();
  this.initDynamicPoiLayers();
  Object(customEvents["b" /* listen */])('add_category_markers', this.addCategoryMarkers);
  Object(customEvents["b" /* listen */])('remove_category_markers', this.removeCategoryMarkers);
  Object(customEvents["b" /* listen */])('highlight_category_marker', this.highlightPoiMarker);
  Object(customEvents["b" /* listen */])('click_category_marker', this.selectPoiMarker);
  Object(customEvents["b" /* listen */])('click_category_poi', this.selectPoi);
  Object(customEvents["b" /* listen */])('clean_marker', () => this.selectPoiMarker(null));
});


// EXTERNAL MODULE: ./src/libs/url_utils.js
var url_utils = __webpack_require__(22);

// EXTERNAL MODULE: ./src/libs/bounds.js
var bounds = __webpack_require__(167);

// CONCATENATED MODULE: ./src/mapbox/locale.js
/* global _ */
var defaultLocale = {
  'GeolocateControl.FindMyLocation': _('My location', 'mapbox')
};
/* harmony default export */ var locale = (defaultLocale);
// CONCATENATED MODULE: ./src/adapters/scene.js
function scene_asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function scene_asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { scene_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { scene_asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function scene_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function scene_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? scene_ownKeys(Object(source), !0).forEach(function (key) { scene_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : scene_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function scene_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }























var scene_baseUrl = nconf_getter["default"].get().system.baseUrl;
var LONG_TOUCH_DELAY_MS = 500;
var MOBILE_IDLE_DELAY_MS = 2000;
var MOBILE_IDLE_TIMEOUT;

function Scene() {
  this.currentMarker = null;
  this.popup = new poi_popup();
  this.savedLocation = null;
}

var getPoiView = poi => ({
  center: poi.geometry.center,
  zoom: Object(libs_pois["getBestZoom"])(poi),
  bounds: poi.geometry.bbox
});

var hideMobileScale = function hideMobileScale() {
  var item = document.querySelector('.map_control__scale');

  if (item) {
    item.classList.add('fadeOut');
  }
};

var showMobileScale = function showMobileScale() {
  var item = document.querySelector('.map_control__scale');

  if (item) {
    item.classList.remove('fadeOut');
  }
};

Scene.prototype.getMapInitOptions = function (_ref) {
  var locationHash = _ref.locationHash,
      bbox = _ref.bbox;

  if (bbox) {
    try {
      return {
        bounds: Object(bounds["c" /* parseBboxString */])(bbox)
      };
    } catch (e) {
      console.error(e);
    }
  }

  if (window.hotLoadPoi) {
    return getPoiView(window.hotLoadPoi);
  }

  if (locationHash) {
    return {
      zoom: locationHash.zoom,
      center: [locationHash.lng, locationHash.lat]
    };
  }

  var lastLocation = Object(store["f" /* getLastLocation */])();

  if (lastLocation) {
    return {
      zoom: lastLocation.zoom,
      center: [lastLocation.lng, lastLocation.lat]
    };
  }

  if (window.initialBbox) {
    return {
      bounds: window.initialBbox,
      fitBoundsOptions: {
        maxZoom: 9
      }
    };
  }

  return {
    zoom: constants["map"].zoom,
    center: [constants["map"].center.lng, constants["map"].center.lat]
  };
};

Scene.prototype.initMapBox = function (_ref2) {
  var locationHash = _ref2.locationHash,
      bbox = _ref2.bbox;
  window.times.initMapBox = Date.now();
  var compilationHash = window.__config.compilationHash;
  Object(mapbox_gl_js_mock["setRTLTextPlugin"])("".concat(scene_baseUrl, "statics/build/javascript/map_plugins/mapbox-gl-rtl-text-").concat(compilationHash, ".js"), error => {
    if (error) {
      adapters_error["default"].send('scene', 'setRTLTextPlugin', 'Failed to load mapbox RTL plugin', error);
    }
  },
  /* lazy */
  true);
  this.mb = new mapbox_gl_js_mock["Map"](scene_objectSpread({
    attributionControl: false,
    container: 'scene_container',
    style: getStyle(),
    hash: false,
    maxZoom: 20,
    locale: locale
  }, this.getMapInitOptions({
    locationHash,
    bbox
  }))); // @MAPBOX: This method isn't implemented by the Mapbox-GL mock

  this.mb.setPadding = this.mb.setPadding || (() => undefined);

  this.mb.setPadding(Object(layouts["a" /* getCurrentMapPaddings */])());
  this.popup.init(this.mb);
  window.map = this;
  var interactiveLayers = ['poi-level-1', 'poi-level-2', 'poi-level-3', 'poi-level-public-transports-1', 'poi-level-public-transports-2'];
  this.hoveredPoi = null; // Max time between two touch to be considered a single "double click" event
  // This is the value Mapbox-GL uses, in src/ui/handler/dblclick_zoom.js

  this.DOUBLE_TAP_DELAY_MS = 300;
  this.lastDoubleTapTimeStamp = 0;
  this.lastTouchEndTimeStamp = 0;
  this.mb.on('touchend', () => {
    var timeStamp = Date.now(); // maybe we should also check the distance between the two touch events…

    if (timeStamp - this.lastTouchEndTimeStamp < this.DOUBLE_TAP_DELAY_MS) {
      this.lastDoubleTapTimeStamp = timeStamp;
    }

    this.lastTouchEndTimeStamp = timeStamp;
  });
  this.mb.on('load', () => {
    Object(customEvents["a" /* fire */])('restart_idle_timeout');
    this.onHashChange();
    new scene_direction_SceneDirection(this.mb);
    new scene_category_SceneCategory(this.mb);
    this.mb.addControl(new extended_nav_control_ExtendedControl(), 'bottom-right');
    this.mb.addControl(new MobileCompassControl(), 'top-right');

    if (!Object(device["c" /* isMobileDevice */])()) {
      interactiveLayers.forEach(interactiveLayer => {
        setPoiHoverStyle(this.mb, interactiveLayer);
        this.mb.on('mouseenter', interactiveLayer, e => {
          if (e.features.length > 0) {
            this.hoveredPoi = e.features[0];
            this.mb.setFeatureState(this.hoveredPoi, {
              hover: true
            });
          }

          this.mb.getCanvas().style.cursor = 'pointer';
        });
        this.mb.on('mouseleave', interactiveLayer, () => {
          if (this.hoveredPoi) {
            this.mb.setFeatureState(this.hoveredPoi, {
              hover: false
            });
            this.hoveredPoi = null;
          }

          this.mb.getCanvas().style.cursor = '';
        });
        this.popup.addListener(interactiveLayer);
      });
    } // we have to delay click event resolution to make time for possible double click events,
    // which are thrown *after* two separate click events are thrown


    this.clickDelayHandler = null;
    this.mb.on('click', e => {
      Object(customEvents["a" /* fire */])('restart_idle_timeout');

      if (e.originalEvent.cancelBubble) {
        return;
      } // cancel the previous click handler if it's still pending


      clearTimeout(this.clickDelayHandler); // if this is a real mouse double-click, we can simply return here

      if (e.originalEvent.detail >= 2) {
        return;
      }

      var pois = this.mb.queryRenderedFeatures(e.point, {
        layers: interactiveLayers
      }); // when clicking on a POI, just trigger the action without delay,
      // as a subsequent double click isn't a problem

      if (pois[0]) {
        this.clickOnMap(e.lngLat, pois[0]);
        return;
      }

      this.clickDelayHandler = setTimeout(() => {
        // for touch UX we have to make sure a double tap zoom hasn't been made in the meantime
        if (Date.now() - this.lastDoubleTapTimeStamp < this.DOUBLE_TAP_DELAY_MS) {
          return;
        }

        this.clickOnMap(e.lngLat, null);
      }, this.DOUBLE_TAP_DELAY_MS);
    }); // Long touch polyfill (for mobile devices and touch screens)
    // Custom implementation because the contextmenu event isn't supported by MapBox.
    // Long touch is initiated on touchstart event, and canceled if a move, gesture or touchend occurs before 500ms.
    // Sources:
    // https://stackoverflow.com/a/1943768 (explanation of 500ms delay)
    // https://stackoverflow.com/a/54746189 (polyfill implementation also using the 500ms delay)

    var longTouchTimeout = null;
    this.mb.on('touchstart', e => {
      Object(customEvents["a" /* fire */])('restart_idle_timeout');

      if (e.originalEvent.touches.length === 1) {
        longTouchTimeout = setTimeout(() => {
          this.clickOnMap(e.lngLat, null, {
            longTouch: true
          });
          this.cancelClickAfterLongTouch = true;
        }, LONG_TOUCH_DELAY_MS);
      }
    });
    var longTouchCancellingEvents = ['touchend', // 'touchcancel', // ignore this event as it's always thrown by Firefox Android
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1481923
    // Doesn't seem to change the behavior for other browsers
    'touchmove', 'pointerdrag', 'pointermove', 'moveend', 'gesturestart', 'gesturechange', 'gestureend'];

    var cancelLongTouch = e => {
      if (longTouchTimeout) {
        clearTimeout(longTouchTimeout);
        longTouchTimeout = null;
      }

      if (this.cancelClickAfterLongTouch) {
        e.originalEvent.preventDefault();
        this.cancelClickAfterLongTouch = false;
      }
    };

    longTouchCancellingEvents.forEach(event => {
      this.mb.on(event, cancelLongTouch);
    });
    this.mb.on('dragstart', () => {
      Object(customEvents["a" /* fire */])('map_user_interaction');
    });
    this.mb.on('pitchstart', () => {
      Object(customEvents["a" /* fire */])('map_user_interaction');
    });
    this.mb.on('moveend', () => {
      var _this$mb$getCenter = this.mb.getCenter(),
          lng = _this$mb$getCenter.lng,
          lat = _this$mb$getCenter.lat;

      var zoom = this.mb.getZoom();
      Object(store["j" /* setLastLocation */])({
        lng,
        lat,
        zoom
      });
      window.app.updateHash(this.getLocationHash());
      Object(customEvents["a" /* fire */])('map_moveend');
    });

    window.execOnMapLoaded = f => f();

    Object(customEvents["a" /* fire */])('map_loaded');
  });
  Object(customEvents["b" /* listen */])('fit_map', (item, forceAnimate) => {
    this.fitMap(item, forceAnimate);
  });
  Object(customEvents["b" /* listen */])('ensure_poi_visible', (poi, options) => {
    this.ensureMarkerIsVisible(poi, options);
  });
  Object(customEvents["b" /* listen */])('create_poi_marker', poi => {
    this.addMarker(poi);
  });
  Object(customEvents["b" /* listen */])('clean_marker', () => {
    this.cleanMarker();
  });
  Object(customEvents["b" /* listen */])('save_location', () => {
    this.saveLocation();
  });
  Object(customEvents["b" /* listen */])('restore_location', () => {
    this.restoreLocation();
  });
  Object(customEvents["b" /* listen */])('move_mobile_bottom_ui', bottom => {
    this.moveMobileBottomUI(bottom);
  });
  Object(customEvents["b" /* listen */])('move_mobile_geolocation_button', bottom => {
    this.moveMobileGeolocationButton(bottom);
  });
  Object(customEvents["b" /* listen */])('mobile_geolocation_button_visibility', visible => {
    this.mobileButtonVisibility('.mapboxgl-ctrl-geolocate', visible);
  });
  Object(customEvents["b" /* listen */])('mobile_direction_button_visibility', visible => {
    this.mobileButtonVisibility('.direction_shortcut', visible);
  });
  Object(customEvents["b" /* listen */])('update_map_paddings', () => {
    this.mb.setPadding(Object(layouts["a" /* getCurrentMapPaddings */])());
  });
};

Scene.prototype.clickOnMap = function (lngLat, clickedFeature) {
  var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref3$longTouch = _ref3.longTouch,
      longTouch = _ref3$longTouch === void 0 ? false : _ref3$longTouch;

  // Instantiate the place clicked as a PoI
  var poi = clickedFeature ? new map_poi_MapPoi(clickedFeature) : new latlon_poi["a" /* default */](lngLat);

  if (document.querySelector('.directions-open')) {
    // If Direction panel is open, tell it to fill its fields with this PoI
    Object(customEvents["a" /* fire */])('set_direction_point', poi);
  } else if (Object(device["c" /* isMobileDevice */])() && !clickedFeature && !longTouch) {
    // On mobile, simple clicks anywhere don't do anything
    return;
  } else {
    // Default case: open the POI panel
    window.app.navigateTo("/place/".concat(Object(libs_pois["toUrl"])(poi)), {
      poi
    });
  }
};

Scene.prototype.saveLocation = function () {
  this.savedLocation = this.getLocationHash();
};

Scene.prototype.restoreLocation = function () {
  if (this.savedLocation) {
    var _parseMapHash = Object(url_utils["parseMapHash"])(this.savedLocation),
        zoom = _parseMapHash.zoom,
        lat = _parseMapHash.lat,
        lng = _parseMapHash.lng;

    var flyOptions = {
      center: [lng, lat],
      zoom,
      animate: true,
      screenSpeed: 2
    };
    this.mb.flyTo(flyOptions);
  }
};

var clamp = (min, max, value) => Math.min(max, Math.max(min, value));

Scene.prototype.isBBoxInExtendedViewport = function (bbox) {
  var viewport = this.mb.getBounds();
  var width = viewport.getEast() - viewport.getWest();
  var height = viewport.getNorth() - viewport.getSouth(); // Compute extended viewport, with lats between -85 and 85

  viewport.setNorthEast(new mapbox_gl_js_mock["LngLat"](viewport.getEast() + width, clamp(-85, 85, viewport.getNorth() + height)).wrap());
  viewport.setSouthWest(new mapbox_gl_js_mock["LngLat"](viewport.getWest() - width, clamp(-85, 85, viewport.getSouth() - height)).wrap()); // Check if the bbox overlaps the viewport

  return viewport.contains(bbox.getNorthWest()) || viewport.contains(bbox.getNorthEast()) || viewport.contains(bbox.getSouthEast()) || viewport.contains(bbox.getSouthWest());
};

Scene.prototype.fitBbox = function (bbox, forceAnimate) {
  // normalise bbox
  if (bbox instanceof Array) {
    bbox = new mapbox_gl_js_mock["LngLatBounds"](bbox);
  } // Animate if the zoom is big enough and if the BBox is (partially or fully) in
  // the extended viewport.


  var animate = forceAnimate || this.mb.getZoom() > 10 && this.isBBoxInExtendedViewport(bbox);
  this.mb.fitBounds(bbox, {
    animate
  });
}; // Move the map to focus on an item


Scene.prototype.fitMap = function (item, forceAnimate) {
  // BBox
  if (item instanceof mapbox_gl_js_mock["LngLatBounds"] || Array.isArray(item)) {
    this.fitBbox(item, forceAnimate);
  } else {
    // PoI
    if (item.bbox) {
      // poi Bbox
      this.fitBbox(item.bbox, forceAnimate);
    } else {
      // poi center
      var flyOptions = {
        center: item.latLon,
        zoom: Object(libs_pois["getBestZoom"])(item),
        screenSpeed: 1.5,
        animate: false
      };

      if (forceAnimate || this.mb.getZoom() > 10 && this.isWindowedPoi(item)) {
        flyOptions.animate = true;
      }

      this.mb.flyTo(flyOptions);
    }
  }
};

Scene.prototype.ensureMarkerIsVisible = function (poi, options) {
  if (poi.bbox) {
    this.fitBbox(poi.bbox);
    return;
  }

  var isMobile = Object(device["c" /* isMobileDevice */])();

  if (!options.centerMap) {
    var isPoiUnderPanel = Object(layouts["c" /* isPositionUnderUI */])(this.mb.project(poi.latLon), {
      isMobile
    });

    if (this.isWindowedPoi(poi) && !isPoiUnderPanel) {
      return;
    }
  }

  this.mb.flyTo({
    center: poi.latLon,
    zoom: Object(libs_pois["getBestZoom"])(poi),
    maxDuration: 1200
  });
};

Scene.prototype.addMarker = function (poi) {
  var element = Object(icon_manager["createDefaultPin"])();

  element.onclick = function (e) {
    // click event should not be propagated to the map itself;
    e.stopPropagation();
  };

  if (this.currentMarker !== null) {
    this.currentMarker.remove();
  }

  var marker = new mapbox_gl_js_mock["Marker"]({
    element,
    anchor: 'bottom',
    offset: [0, -5]
  }).setLngLat(poi.latLon).addTo(this.mb);
  this.currentMarker = marker;
  return marker;
};

Scene.prototype.cleanMarker = /*#__PURE__*/scene_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.currentMarker !== null) {
            this.currentMarker.remove();
            this.currentMarker = null;
          }

        case 1:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));

Scene.prototype.isWindowedPoi = function (poi) {
  return this.mb.getBounds().contains(new mapbox_gl_js_mock["LngLat"](poi.latLon.lng, poi.latLon.lat));
};

Scene.prototype.getLocationHash = function () {
  var _this$mb$getCenter2 = this.mb.getCenter(),
      lat = _this$mb$getCenter2.lat,
      lng = _this$mb$getCenter2.lng;

  return Object(url_utils["getMapHash"])(this.mb.getZoom(), lat, lng);
};

Scene.prototype.restoreFromHash = function (hash) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var zll = Object(url_utils["parseMapHash"])(hash);

  if (!zll) {
    return;
  }

  var zoom = zll.zoom,
      lat = zll.lat,
      lng = zll.lng;
  this.mb.flyTo(scene_objectSpread({
    zoom,
    center: [lng, lat]
  }, options));
};

Scene.prototype.onHashChange = function () {
  window.onhashchange = () => {
    this.restoreFromHash(window.location.hash, {
      animate: false
    });
  };
};

Scene.prototype.translateUIControl = function (selector, bottom) {
  var item = document.querySelector(selector);

  if (item) {
    item.style.transform = "translateY(".concat(-bottom, "px)");
  }
};

Scene.prototype.moveMobileBottomUI = function () {
  var bottom = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  if (!Object(device["c" /* isMobileDevice */])() && bottom > 0) {
    return;
  }

  var uiControls = ['.map_control__scale_attribute_container', '.mapboxgl-ctrl-geolocate', '.direction_shortcut'];
  uiControls.forEach(uiControl => {
    this.translateUIControl(uiControl, bottom);
  });
};

Scene.prototype.moveMobileGeolocationButton = function () {
  var bottom = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  if (!Object(device["c" /* isMobileDevice */])() && bottom > 0) {
    return;
  }

  this.translateUIControl('.mapboxgl-ctrl-geolocate', bottom);
};

Scene.prototype.mobileButtonVisibility = function (selector, visible) {
  if (!Object(device["c" /* isMobileDevice */])()) {
    return;
  }

  var item = document.querySelector(selector);

  if (item) {
    if (visible) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  }
};

Object(customEvents["b" /* listen */])('restart_idle_timeout', () => {
  // Cancel idle status
  showMobileScale();
  clearTimeout(MOBILE_IDLE_TIMEOUT); // Start a new 2s idle timeout

  MOBILE_IDLE_TIMEOUT = setTimeout(() => {
    hideMobileScale();
  }, MOBILE_IDLE_DELAY_MS);
});
/* harmony default export */ var scene = __webpack_exports__["default"] = (Scene);

/***/ })

}]);
//# sourceMappingURL=map-c464fb7f136130c8ab4a.bundle.js.map