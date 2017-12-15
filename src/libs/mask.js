(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MasqClient = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    ;(function (root) {
      /**
       * Forked from https://github.com/zendesk/cross-storage
       *
       * Constructs a new cross storage client given the url to a hub. By default,
       * an iframe is created within the document body that points to the url. It
       * also accepts an options object, which may include a timeout, frameId, and
       * promise. The timeout, in milliseconds, is applied to each request and
       * defaults to 5000ms. The options object may also include a frameId,
       * identifying an existing frame on which to install its listeners. If the
       * promise key is supplied the constructor for a Promise, that Promise library
       * will be used instead of the default window.Promise.
       *
       * @example
       * var storage = new MasqClient('https://store.example.com/hub.html');
       *
       * @example
       * var storage = new MasqClient('https://store.example.com/hub.html', {
   *   timeout: 5000,
   *   frameId: 'storageFrame'
   * });
       *
       * @constructor
       *
       * @param {string} url    The url to a cross storage hub
       * @param {object} [opts] An optional object containing additional options,
       *                        including timeout, frameId, and promise
       *
       * @property {string}   _id        A UUID v4 id
       * @property {function} _promise   The Promise object to use
       * @property {string}   _frameId   The id of the iFrame pointing to the hub url
       * @property {string}   _origin    The hub's origin
       * @property {object}   _requests  Mapping of request ids to callbacks
       * @property {bool}     _connected Whether or not it has connected
       * @property {bool}     _closed    Whether or not the client has closed
       * @property {int}      _count     Number of requests sent
       * @property {function} _listener  The listener added to the window
       * @property {Window}   _hub       The hub window
       */
      function MasqClient (url, opts) {
        url = url || 'https://qwantresearch.github.io/masq-store/'
        opts = opts || {}

        this._id = MasqClient._generateUUID()
        this._promise = opts.promise || Promise
        this._frameId = opts.frameId || 'MasqClient-' + this._id
        this._origin = MasqClient._getOrigin(url)
        this._requests = {}
        this._connected = false
        this._closed = false
        this._count = 0
        this._timeout = opts.timeout || 5000
        this._listener = null

        this._installListener()

        var frame
        if (opts.frameId) {
          frame = document.getElementById(opts.frameId)
        }

        // If using a passed iframe, poll the hub for a ready message
        if (frame) {
          this._poll()
        }

        // Create the frame if not found or specified
        frame = frame || this._createFrame(url)
        this._hub = frame.contentWindow
      }

      /**
       * The styles to be applied to the generated iFrame. Defines a set of properties
       * that hide the element by positioning it outside of the visible area, and
       * by modifying its display.
       *
       * @member {Object}
       */
      MasqClient.frameStyle = {
        display: 'none',
        position: 'absolute',
        top: '-999px',
        left: '-999px'
      }

      /**
       * Returns the origin of an url, with cross browser support. Accommodates
       * the lack of location.origin in IE, as well as the discrepancies in the
       * inclusion of the port when using the default port for a protocol, e.g.
       * 443 over https. Defaults to the origin of window.location if passed a
       * relative path.
       *
       * @param   {string} url The url to a cross storage hub
       * @returns {string} The origin of the url
       */
      MasqClient._getOrigin = function (url) {
        var uri, protocol, origin

        uri = document.createElement('a')
        uri.href = url

        if (!uri.host) {
          uri = window.location
        }

        if (!uri.protocol || uri.protocol === ':') {
          protocol = window.location.protocol
        } else {
          protocol = uri.protocol
        }

        origin = protocol + '//' + uri.host
        origin = origin.replace(/:80$|:443$/, '')

        return origin
      }

      /**
       * UUID v4 generation, taken from: http://stackoverflow.com/questions/
       * 105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
       *
       * @returns {string} A UUID v4 string
       */
      MasqClient._generateUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)

          return v.toString(16)
        })
      }

      /**
       * Returns a promise that is fulfilled when a connection has been established
       * with the cross storage hub. Its use is required to avoid sending any
       * requests prior to initialization being complete.
       *
       * @returns {Promise} A promise that is resolved on connect
       */
      MasqClient.prototype.onConnect = function () {
        var client = this

        if (this._connected) {
          return this._promise.resolve()
        } else if (this._closed) {
          return this._promise.reject(new Error('MasqClient has closed'))
        }

        // Queue connect requests for client re-use
        if (!this._requests.connect) {
          this._requests.connect = []
        }

        return new this._promise(function (resolve, reject) {
          var timeout = setTimeout(function () {
            reject(new Error('MasqClient could not connect'))
          }, client._timeout)

          client._requests.connect.push(function (err) {
            clearTimeout(timeout)
            if (err) return reject(err)

            resolve()
          })
        })
      }

      /**
       * Sets a key to the specified value. Returns a promise that is fulfilled on
       * success, or rejected if any errors setting the key occurred, or the request
       * timed out.
       *
       * @param   {string}  key   The key to set
       * @param   {*}       value The value to assign
       * @returns {Promise} A promise that is settled on hub response or timeout
       */
      MasqClient.prototype.set = function (key, value) {
        return this._request('set', {
          key: key,
          value: value
        })
      }

      /**
       * Accepts one or more keys for which to retrieve their values. Returns a
       * promise that is settled on hub response or timeout. On success, it is
       * fulfilled with the value of the key if only passed a single argument.
       * Otherwise it's resolved with an array of values. On failure, it is rejected
       * with the corresponding error message.
       *
       * @param   {...string} key The key to retrieve
       * @returns {Promise}   A promise that is settled on hub response or timeout
       */
      MasqClient.prototype.get = function (key) {
        var args = Array.prototype.slice.call(arguments)

        return this._request('get', {keys: args})
      }

      /**
       * Accepts one or more keys for deletion. Returns a promise that is settled on
       * hub response or timeout.
       *
       * @param   {...string} key The key to delete
       * @returns {Promise}   A promise that is settled on hub response or timeout
       */
      MasqClient.prototype.del = function () {
        var args = Array.prototype.slice.call(arguments)

        return this._request('del', {keys: args})
      }

      /**
       * Clears all the remote store for the current origin.
       *
       * Returns a promise that, when resolved, indicates that all localStorage
       * data has been cleared.
       *
       * @returns {Promise} A promise that is settled on hub response or timeout
       */
      MasqClient.prototype.clear = function () {
        return this._request('clear')
      }

      /**
       * Gets all the remote data for the current origin.
       *
       * Returns a promise that, when resolved, passes an array of all keys
       * currently in storage.
       *
       * @returns {Promise} A promise that is settled on hub response or timeout
       */
      MasqClient.prototype.getAll = function () {
        return this._request('getAll')
      }

      /**
       * Sets all data for the current origin.
       *
       * Returns a promise that, when resolved, passes an array of all keys
       * currently in storage.
       *
       * @param   {object}  data   The data object to set
       * @returns {Promise} A promise that is settled on hub response or timeout
       */
      MasqClient.prototype.setAll = function (data) {
        return this._request('setAll', data)
      }

      /**
       * Gets all the remote metadata for the current origin.
       *
       * Returns a promise that, when resolved, passes an array of all keys
       * currently in storage.
       *
       * @returns {Promise} A promise that is settled on hub response or timeout
       */
      MasqClient.prototype.getMeta = function () {
        return this._request('getMeta')
      }

      /**
       * Deletes the iframe and sets the connected state to false. The client can
       * no longer be used after being invoked.
       */
      MasqClient.prototype.close = function () {
        var frame = document.getElementById(this._frameId)
        if (frame) {
          frame.parentNode.removeChild(frame)
        }

        // Support IE8 with detachEvent
        if (window.removeEventListener) {
          window.removeEventListener('message', this._listener, false)
        } else {
          window.detachEvent('onmessage', this._listener)
        }

        this._connected = false
        this._closed = true
      }

      /**
       * Installs the necessary listener for the window message event. When a message
       * is received, the client's _connected status is changed to true, and the
       * onConnect promise is fulfilled. Given a response message, the callback
       * corresponding to its request is invoked. If response.error holds a truthy
       * value, the promise associated with the original request is rejected with
       * the error. Otherwise the promise is fulfilled and passed response.result.
       *
       * @private
       */
      MasqClient.prototype._installListener = function () {
        var client = this

        this._listener = function (message) {
          var i, origin, error, response

          // Ignore invalid messages or those after the client has closed
          if (client._closed || !message.data) {
            return
          }

          // postMessage returns the string "null" as the origin for "file://"
          origin = (message.origin === 'null') ? 'file://' : message.origin

          // Ignore messages not from the correct origin
          if (origin !== client._origin) return

          // LocalStorage isn't available in the hub
          if (message.data['cross-storage'] === 'unavailable') {
            if (!client._closed) client.close()
            if (!client._requests.connect) return

            error = new Error('Closing client. Could not access localStorage in hub.')
            for (i = 0; i < client._requests.connect.length; i++) {
              client._requests.connect[i](error)
            }

            return
          }

          // Handle initial connection
          if (message.data['cross-storage'] && !client._connected) {
            client._connected = true
            if (!client._requests.connect) return

            for (i = 0; i < client._requests.connect.length; i++) {
              client._requests.connect[i](error)
            }
            delete client._requests.connect
          }

          if (message.data['cross-storage'] === 'ready') return

          // All other messages
          try {
            response = message.data
          } catch (e) {
            return
          }

          if (!response.client) return

          if (message.data['sync']) {
            var syncEvt = new CustomEvent('Sync')
            document.dispatchEvent(syncEvt)
          }

          if (client._requests[response.client]) {
            client._requests[response.client](response.error, response.result)
          }
        }

        // Support IE8 with attachEvent
        if (window.addEventListener) {
          window.addEventListener('message', this._listener, false)
        } else {
          window.attachEvent('onmessage', this._listener)
        }
      }

      /**
       * Invoked when a frame id was passed to the client, rather than allowing
       * the client to create its own iframe. Polls the hub for a ready event to
       * establish a connected state.
       */
      MasqClient.prototype._poll = function () {
        var client, interval, targetOrigin

        client = this

        // postMessage requires that the target origin be set to "*" for "file://"
        targetOrigin = (client._origin === 'file://') ? '*' : client._origin

        interval = setInterval(function () {
          if (client._connected) return clearInterval(interval)
          if (!client._hub) return

          client._hub.postMessage({'cross-storage': 'poll'}, targetOrigin)
        }, 100)
      }

      /**
       * Creates a new iFrame containing the hub. Applies the necessary styles to
       * hide the element from view, prior to adding it to the document body.
       * Returns the created element.
       *
       * @private
       *
       * @param  {string}            url The url to the hub
       * returns {HTMLIFrameElement} The iFrame element itself
       */
      MasqClient.prototype._createFrame = function (url) {
        var frame, key

        frame = window.document.createElement('iframe')
        frame.id = this._frameId

        // Style the iframe
        for (key in MasqClient.frameStyle) {
          if (MasqClient.frameStyle.hasOwnProperty(key)) {
            frame.style[key] = MasqClient.frameStyle[key]
          }
        }

        window.document.body.appendChild(frame)
        frame.src = url

        return frame
      }

      /**
       * Sends a message containing the given method and params to the hub. Stores
       * a callback in the _requests object for later invocation on message, or
       * deletion on timeout. Returns a promise that is settled in either instance.
       *
       * @private
       *
       * @param   {string}  method The method to invoke
       * @param   {*}       params The arguments to pass
       * @returns {Promise} A promise that is settled on hub response or timeout
       */
      MasqClient.prototype._request = function (method, params) {
        var req, client

        if (this._closed) {
          return this._promise.reject(new Error('MasqClient has closed'))
        }

        client = this
        client._count++

        req = {
          client: this._id + ':' + client._count,
          method: method,
          params: params
        }

        return new this._promise(function (resolve, reject) {
          var timeout, originalToJSON, targetOrigin

          // Timeout if a response isn't received after 4s
          timeout = setTimeout(function () {
            if (!client._requests[req.client]) return

            delete client._requests[req.client]
            reject(new Error('Timeout: could not perform ' + req.method))
          }, client._timeout)

          // Add request callback
          client._requests[req.client] = function (err, result) {
            clearTimeout(timeout)
            delete client._requests[req.client]
            if (err) return reject(new Error(err))
            resolve(result)
          }

          // In case we have a broken Array.prototype.toJSON, e.g. because of
          // old versions of prototype
          if (Array.prototype.toJSON) {
            originalToJSON = Array.prototype.toJSON
            Array.prototype.toJSON = null
          }

          // postMessage requires that the target origin be set to "*" for "file://"
          targetOrigin = (client._origin === 'file://') ? '*' : client._origin

          // Send  message
          client._hub.postMessage(req, targetOrigin)

          // Restore original toJSON
          if (originalToJSON) {
            Array.prototype.toJSON = originalToJSON
          }
        })
      }

      /**
       * Export for various environments.
       */
      if (typeof module !== 'undefined' && module.exports) {
        module.exports = MasqClient
      } else if (typeof exports !== 'undefined') {
        exports.MasqClient = MasqClient
      } else if (typeof define === 'function' && define.amd) {
        define([], function () {
          return MasqClient
        })
      } else {
        root.MasqClient = MasqClient
      }
    }(this))

  },{}]},{},[1])(1)
});