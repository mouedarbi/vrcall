(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["RicohAPIWebRTC"] = factory();
	else
		root["RicohAPIWebRTC"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* global m,USER */
	'use strict';

	/**
	 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
	 * See LICENSE for more information
	 */

	var App = __webpack_require__(1).App;
	var Compo = __webpack_require__(26);

	// window.__oneway = true;

	if (typeof m === 'undefined') {
	  // headless
	  var app = App.getInstance();
	  app.headless(USER.userId, USER.userPass, document.querySelector('#wrapper'));
	} else {
	  m.route.mode = 'hash';
	  m.route(document.querySelector('#wrapper'), '/streaming/', {
	    '/streaming': Compo.login,
	    '/streaming/vchat': Compo.chat
	  });
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* global Clipboard,RTCMultiConnection,DetectRTC,m,CONFIG */
	/* eslint no-console: ["error", { allow: ["error"] }] */
	'use strict';

	/**
	 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
	 * See LICENSE for more information
	 */

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var RicohAPI = __webpack_require__(2);
	var UDCConnection = __webpack_require__(25).UDCConnection;

	var conn = new RTCMultiConnection();
	var aclient = new RicohAPI.AuthClient(CONFIG.clientId, CONFIG.clientSecret);
	var bosh = new RicohAPI.BoshClient(aclient);

	if (typeof Clipboard !== 'undefined') {
	  var clipboard = new Clipboard('.cpbtn');
	  clipboard.on('success', function (e) {
	    return e.clearSelection();
	  });
	}

	var _instance = null; // for singleton

	// Model

	var App = exports.App = function () {
	  function App() {
	    _classCallCheck(this, App);

	    if (_instance !== null) return _instance;
	    this._cameras = [];
	    this.isWatcher = false;
	    this.isFirefox = false;
	    this.isOneWay = typeof window.__oneway !== 'undefined';

	    if (typeof m === 'undefined') return _instance;
	    this.username = m.prop('');
	    this.userpass = m.prop('');
	    this.peername = m.prop('');
	    this.peerurl = m.prop('');
	    this.peermoz = m.prop('');
	    this.peerurlid = m.prop('');
	    this.myurl = m.prop('');
	    this.mymoz = m.prop('');
	    this.myurlid = m.prop('');
	    this.camid = m.prop('');
	    this.state = m.prop('initial');

	    _instance = this;
	    return _instance;
	  }

	  _createClass(App, [{
	    key: '_connect',
	    value: function _connect(uname, upass) {
	      return new Promise(function (resolve, reject) {
	        aclient.setResourceOwnerCreds(uname.split('+')[0], upass);
	        bosh.connect(uname, upass).then(function () {
	          conn.userid = uname;
	          conn.bosh = bosh;
	          conn.setCustomSocketHandler(UDCConnection);
	          conn.socketMessageEvent = 'ricohapi-streaming';
	          conn.mediaConstraints.audio = false;
	          resolve();
	        }).catch(function (e) {
	          console.error(e);
	          reject();
	        });
	      });
	    }
	  }, {
	    key: 'connect',
	    value: function connect() {
	      var _this = this;

	      this.state('connecting');
	      return new Promise(function (resolve, reject) {
	        _this._connect(_this.username(), _this.userpass()).then(function () {
	          _this.state('ready');
	          resolve();
	        }).catch(function () {
	          _this.state('fail');
	          reject();
	        });
	      });
	    }
	  }, {
	    key: 'disconnect',
	    value: function disconnect() {
	      var _this2 = this;

	      conn.close();
	      setTimeout(function () {
	        // delay for firefox
	        bosh.disconnect();
	        _this2.myurl('');
	        _this2.mymoz('');
	        _this2.peerurl('');
	        _this2.peermoz('');
	        _this2.camid('');
	        _this2.state('initial');
	      }, 1000);
	    }
	  }, {
	    key: '_rmc3',
	    value: function _rmc3() {
	      var _this3 = this;

	      this.state('calling');
	      conn.session = { audio: false, video: true, oneway: this.isOneWay };
	      conn.sdpConstraints.mandatory = {
	        OfferToReceiveAudio: false,
	        OfferToReceiveVideo: !this.isOneWay
	      };
	      conn.onstream = function (event) {
	        var elm = event.mediaElement;
	        elm.controls = false;
	        if (_this3.myurl() || _this3.mymoz() || _this3.isWatcher) {
	          if (conn.DetectRTC.browser.isFirefox) _this3.peermoz(elm.mozSrcObject);else _this3.peerurl(elm.src);
	          _this3.peerurlid(elm.id);
	          _this3.peername(event.userid);
	          _this3.state('chatting');
	        } else {
	          if (conn.DetectRTC.browser.isFirefox) _this3.mymoz(elm.mozSrcObject);else _this3.myurl(elm.src);
	          _this3.myurlid(elm.id);
	          _this3.state('chatready');
	        }
	        elm.play();
	        setTimeout(function () {
	          return elm.play();
	        }, 5000);
	        m.redraw();
	      };
	    }
	  }, {
	    key: 'call',
	    value: function call() {
	      if (this.isOneWay) this.isWatcher = true;
	      this._rmc3();
	      conn.join(this.peername());
	    }
	  }, {
	    key: 'open',
	    value: function open() {
	      conn.mediaConstraints.video = { deviceId: this.camid() };
	      this._rmc3();
	      conn.open(this.username());
	    }
	  }, {
	    key: 'list',
	    value: function list(cb) {
	      var _this4 = this;

	      conn.DetectRTC.load(function () {
	        conn.DetectRTC.MediaDevices.forEach(function (device) {
	          if (device.kind.indexOf('video') === -1) return;
	          _this4.isFirefox = device.label === 'Please invoke getUserMedia once.';
	          var did = _this4.isFirefox ? '' : device.id;
	          var dlabel = _this4.isFirefox ? 'choose when needed' : device.label;
	          if (_this4._cameras.find(function (c) {
	            return c.id === did;
	          })) return;
	          _this4._cameras.push({ id: did, label: dlabel });
	        });
	        cb(_this4._cameras);
	      });
	    }

	    // out of Mithril

	  }, {
	    key: 'headless',
	    value: function headless(uname, upass, dom) {
	      this._connect(uname, upass).then(function () {
	        conn.videosContainer = dom;
	        conn.session = { audio: false, video: true, oneway: true };
	        conn.sdpConstraints.mandatory = {
	          OfferToReceiveAudio: false,
	          OfferToReceiveVideo: false
	        };
	        conn.onstream = function (event) {
	          var elm = event.mediaElement;
	          conn.videosContainer.appendChild(elm);
	          elm.play();
	          setTimeout(function () {
	            return elm.play();
	          }, 3000);
	        };
	        conn.open(uname);
	      }).catch(console.error);
	    }
	  }], [{
	    key: 'getInstance',
	    value: function getInstance() {
	      if (_instance === null) {
	        _instance = new App();
	      }
	      return _instance;
	    }
	  }]);

	  return App;
	}();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* global Strophe */
	/* eslint no-console: ["error", { allow: ["info"] }] */
	'use strict';
	/*
	 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
	 * See LICENSE for more information
	 */

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var EventEmitter = __webpack_require__(3).EventEmitter;
	var AuthClient = __webpack_require__(4).AuthClient;
	// const Strophe = require('node-strophe').Strophe.Strophe;

	if (Strophe.SASLSHA1) {
	  Strophe.SASLSHA1.test = function () {
	    return false;
	  };
	}

	var MSGS = {};
	MSGS[Strophe.Status.CONNECTING] = 'The connection is currently being made.';
	MSGS[Strophe.Status.CONNFAIL] = 'The connection attempt failed.';
	MSGS[Strophe.Status.AUTHENTICATING] = 'The connection is authenticating.';
	MSGS[Strophe.Status.AUTHFAIL] = 'The authentication attempt failed.';
	MSGS[Strophe.Status.CONNECTED] = 'The connection has succeeded.';
	MSGS[Strophe.Status.DISCONNECTED] = 'The connection has been terminated.';
	MSGS[Strophe.Status.DISCONNECTING] = 'The connection is currently being terminated.';
	MSGS[Strophe.Status.ATTACHED] = 'The connection has been attached.';
	MSGS[Strophe.Status.ERROR] = 'An error has occurred.';

	var BoshClient = function (_EventEmitter) {
	  _inherits(BoshClient, _EventEmitter);

	  _createClass(BoshClient, [{
	    key: '_getBareJID',
	    value: function _getBareJID(userID) {
	      return userID.replace(/@/g, '\\40') + '@sig.ricohapi.com';
	    }
	  }, {
	    key: '_getUserID',
	    value: function _getUserID(jid) {
	      return jid.split('@')[0].replace(/\\40/g, '@');
	    }
	  }, {
	    key: '_onConnect',
	    value: function _onConnect(resolve, reject, status) {
	      console.info(MSGS[status]);

	      if (status === Strophe.Status.AUTHFAIL || status === Strophe.Status.CONNFAIL || status === Strophe.Status.ERROR) {
	        reject(MSGS[status]);
	        return true;
	      }
	      if (status === Strophe.Status.CONNECTED) {
	        this._strophe.send(new Strophe.Builder('presence'));
	        resolve(MSGS[status]);
	      }
	      return true;
	    }
	  }, {
	    key: '_onMessage',
	    value: function _onMessage(stanza) {
	      var jid = Strophe.getBareJidFromJid(stanza.attributes.from.value);
	      var userID = this._getUserID(jid);
	      if (stanza.firstChild.nodeType !== 3) return true;
	      // nodeType:3 NODE.TEXT_NODE
	      this.emit('message', userID, stanza.firstChild.textContent);
	      return true;
	    }
	  }]);

	  function BoshClient(authClient) {
	    _classCallCheck(this, BoshClient);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BoshClient).call(this));

	    _this._authClient = authClient;
	    _this._strophe = null;
	    _this._onMessageHandler = null;
	    return _this;
	  }

	  _createClass(BoshClient, [{
	    key: 'connect',
	    value: function connect(userID, userPass) {
	      var _this2 = this;

	      this.id = userID;
	      return new Promise(function (resolve, reject) {
	        _this2._authClient.setResourceOwnerCreds(userID.split('+')[0], userPass);
	        _this2._authClient.session(AuthClient.SCOPES.VStream).then(function (result) {
	          _this2._strophe = new Strophe.Connection('https://sig.ricohapi.com/http-bind/');
	          _this2._onMessageHandler = _this2._strophe.addHandler(_this2._onMessage.bind(_this2), null, 'message');
	          var jid = _this2._getBareJID(userID) + '@sig.ricohapi.com/boshsdk';
	          _this2._strophe.connect(jid, result.access_token, _this2._onConnect.bind(_this2, resolve, reject));
	        }).catch(reject);
	      });
	    }
	  }, {
	    key: 'disconnect',
	    value: function disconnect() {
	      if (!this._strophe) return;
	      this._strophe.disconnect('normal');
	      if (this._onMessageHandler) {
	        this._strophe.deleteHandler(this._onMessageHandler);
	      }
	      this._onMessageHandler = null;
	      this._strophe = null;
	    }
	  }, {
	    key: 'send',
	    value: function send(to, message) {
	      var jid = this._getBareJID(to);
	      this._strophe.send(new Strophe.Builder('message', { to: jid }).t(message));
	    }
	  }]);

	  return BoshClient;
	}(EventEmitter);

	exports.AuthClient = AuthClient;
	exports.BoshClient = BoshClient;

/***/ },
/* 3 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*	
	 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved. 
	 * See LICENSE for more information
	*/
	module.exports = __webpack_require__(5);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	/*
	 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
	 * See LICENSE for more information
	 */

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var axios = __webpack_require__(6);

	var SCOPES = {
	  auth: 'https://ucs.ricoh.com/scope/api/auth',
	  discovery: 'https://ucs.ricoh.com/scope/api/discovery'
	};

	var AUTH_EP = 'https://auth.beta2.ucs.ricoh.com/auth';

	var AuthClient = function () {
	  _createClass(AuthClient, [{
	    key: '_transform',
	    value: function _transform(data) {
	      var str = [];
	      for (var p in data) {
	        if (!data.hasOwnProperty(p)) continue;
	        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(data[p]));
	      }
	      return str.join('&');
	    }
	  }, {
	    key: '_authRequest',
	    value: function _authRequest() {
	      return {
	        method: 'post',
	        url: AUTH_EP + '/token',
	        data: {
	          client_id: this._clientId,
	          client_secret: this._clientSecret,
	          username: this._username,
	          password: this._password,
	          scope: this._scopes.join(' '),
	          grant_type: 'password'
	        }
	      };
	    }
	  }, {
	    key: '_discoveryRequest',
	    value: function _discoveryRequest(scope, token) {
	      return {
	        method: 'post',
	        url: AUTH_EP + '/discovery',
	        headers: {
	          Authorization: 'Bearer ' + token
	        },
	        data: {
	          scope: scope
	        }
	      };
	    }
	  }, {
	    key: '_refreshRequest',
	    value: function _refreshRequest() {
	      return {
	        method: 'post',
	        url: AUTH_EP + '/token',
	        data: {
	          refresh_token: this._refreshToken,
	          client_id: this._clientId,
	          client_secret: this._clientSecret,
	          grant_type: 'refresh_token'
	        }
	      };
	    }
	  }, {
	    key: '_storeTokenInfo',
	    value: function _storeTokenInfo(r) {
	      this.accessToken = r.access_token;
	      this._refreshToken = r.refresh_token;
	      this._expire = r.expires_in * 1000 + Date.now() - 10 * 1000; // 10sec:margin
	    }

	    /**
	     * @param {String} clientId - client ID
	     * @param {String} clientSecret - client secret
	     */

	  }]);

	  function AuthClient(clientId, clientSecret, params) {
	    _classCallCheck(this, AuthClient);

	    if (clientSecret === undefined) throw new Error('parameter error');

	    this._scopes = [SCOPES.auth, SCOPES.discovery];
	    this._clientId = clientId;
	    this._clientSecret = clientSecret;

	    var defaults = {
	      transformRequest: [this._transform],
	      withCredentials: false
	    };
	    if (params && params.agent) {
	      defaults.agent = params.agent;
	    }
	    this._r = axios.create(defaults);
	  }

	  /**
	   * set OAuth resource owner credentials.
	   *
	   * @param {String} user - resource owner user ID
	   * @param {String} pass - resource owner password
	   */


	  _createClass(AuthClient, [{
	    key: 'setResourceOwnerCreds',
	    value: function setResourceOwnerCreds(user, pass) {
	      if (pass === undefined) throw new Error('parameter error');

	      this._username = user;
	      this._password = pass;
	    }

	    /**
	     * open OAuth session
	     *
	     * @param {String} scope - OAuth scope
	     * @returns {Promise} resolve when authenticated, reject otherwise
	     */

	  }, {
	    key: 'session',
	    value: function session(scope) {
	      var _this = this;

	      if (!this._username || !this._password) {
	        throw new Error('state error: need resource owner credentials');
	      }
	      if (scope === undefined) throw new Error('parameter error');
	      this._scopes.push(scope);

	      return this._r.request(this._authRequest()).then(function (ret) {
	        return _this._r.request(_this._discoveryRequest(scope, ret.data.access_token));
	      }).then(function (ret) {
	        _this._storeTokenInfo(ret.data[scope]);
	        return Promise.resolve(ret.data[scope]);
	      });
	    }

	    /**
	     * return valid access_token (update token if needed)
	     *
	     * @param {String} scope - OAuth scope
	     * @returns {Promise} resolve when got, reject otherwise
	     */

	  }, {
	    key: 'getAccessToken',
	    value: function getAccessToken() {
	      var _this2 = this;

	      if (this.accessToken === undefined) {
	        throw new Error('state error: call session()');
	      }
	      if (Date.now() < this._expire) {
	        return Promise.resolve(this.accessToken);
	      }
	      return this._r.request(this._refreshRequest()).then(function (ret) {
	        return _this2._storeTokenInfo(ret.data);
	      }).then(function () {
	        return Promise.resolve(_this2.accessToken);
	      });
	    }
	  }], [{
	    key: 'SCOPES',
	    get: function get() {
	      return {
	        MStorage: 'https://ucs.ricoh.com/scope/api/udc2',
	        VStream: 'https://ucs.ricoh.com/scope/api/udc2',
	        CameraCtl: 'https://ucs.ricoh.com/scope/api/udc2'
	      };
	    }
	  }]);

	  return AuthClient;
	}();

	exports.AuthClient = AuthClient;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(7);

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var defaults = __webpack_require__(8);
	var utils = __webpack_require__(9);
	var dispatchRequest = __webpack_require__(10);
	var InterceptorManager = __webpack_require__(20);
	var isAbsoluteURL = __webpack_require__(21);
	var combineURLs = __webpack_require__(22);
	var bind = __webpack_require__(23);
	var transformData = __webpack_require__(15);

	function Axios(defaultConfig) {
	  this.defaults = utils.merge({}, defaultConfig);
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}

	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }

	  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);

	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }

	  // Don't allow overriding defaults.withCredentials
	  config.withCredentials = config.withCredentials || this.defaults.withCredentials;

	  // Transform request data
	  config.data = transformData(config.data, config.headers, config.transformRequest);

	  // Flatten headers
	  config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers || {});

	  utils.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], function cleanHeaderConfig(method) {
	    delete config.headers[method];
	  });

	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);

	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });

	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });

	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }

	  return promise;
	};

	var defaultInstance = new Axios(defaults);
	var axios = module.exports = bind(Axios.prototype.request, defaultInstance);

	// Expose properties from defaultInstance
	axios.defaults = defaultInstance.defaults;
	axios.interceptors = defaultInstance.interceptors;

	// Factory for creating new instances
	axios.create = function create(defaultConfig) {
	  return new Axios(defaultConfig);
	};

	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(24);

	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function (url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	  axios[method] = bind(Axios.prototype[method], defaultInstance);
	});

	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function (url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	  axios[method] = bind(Axios.prototype[method], defaultInstance);
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(9);

	var PROTECTION_PREFIX = /^\)\]\}',?\n/;
	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};

	module.exports = {
	  transformRequest: [function transformRequest(data, headers) {
	    if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isStream(data)) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isObject(data) && !utils.isFile(data) && !utils.isBlob(data)) {
	      // Set application/json if no Content-Type has been specified
	      if (!utils.isUndefined(headers)) {
	        utils.forEach(headers, function processContentTypeHeader(val, key) {
	          if (key.toLowerCase() === 'content-type') {
	            headers['Content-Type'] = val;
	          }
	        });

	        if (utils.isUndefined(headers['Content-Type'])) {
	          headers['Content-Type'] = 'application/json;charset=utf-8';
	        }
	      }
	      return JSON.stringify(data);
	    }
	    return data;
	  }],

	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      data = data.replace(PROTECTION_PREFIX, '');
	      try {
	        data = JSON.parse(data);
	      } catch (e) {/* Ignore */}
	    }
	    return data;
	  }],

	  headers: {
	    common: {
	      'Accept': 'application/json, text/plain, */*'
	    },
	    patch: utils.merge(DEFAULT_CONTENT_TYPE),
	    post: utils.merge(DEFAULT_CONTENT_TYPE),
	    put: utils.merge(DEFAULT_CONTENT_TYPE)
	  },

	  timeout: 0,

	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',

	  maxContentLength: -1,

	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	/*global toString:true*/

	// utils is a library of generic helper functions non-specific to axios

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var toString = Object.prototype.toString;

	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return toString.call(val) === '[object FormData]';
	}

	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = val && val.buffer && val.buffer instanceof ArrayBuffer;
	  }
	  return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}

	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}

	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
	}

	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}

	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}

	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}

	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  typeof document.createElement -> undefined
	 */
	function isStandardBrowserEnv() {
	  return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.createElement === 'function';
	}

	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }

	  // Force an array if not already something iterable
	  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' && !isArray(obj)) {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }

	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge() /* obj1, obj2, obj3, ... */{
	  var result = {};
	  function assignValue(val, key) {
	    if (_typeof(result[key]) === 'object' && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }

	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}

	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  trim: trim
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	/**
	 * Dispatch a request to the server using whichever adapter
	 * is supported by the current environment.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */

	module.exports = function dispatchRequest(config) {
	  return new Promise(function executor(resolve, reject) {
	    try {
	      var adapter;

	      if (typeof config.adapter === 'function') {
	        // For custom adapter support
	        adapter = config.adapter;
	      } else if (typeof XMLHttpRequest !== 'undefined') {
	        // For browsers use XHR adapter
	        adapter = __webpack_require__(12);
	      } else if (typeof process !== 'undefined') {
	        // For node use HTTP adapter
	        adapter = __webpack_require__(12);
	      }

	      if (typeof adapter === 'function') {
	        adapter(resolve, reject, config);
	      }
	    } catch (e) {
	      reject(e);
	    }
	  });
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 11 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	(function () {
	    try {
	        cachedSetTimeout = setTimeout;
	    } catch (e) {
	        cachedSetTimeout = function () {
	            throw new Error('setTimeout is not defined');
	        }
	    }
	    try {
	        cachedClearTimeout = clearTimeout;
	    } catch (e) {
	        cachedClearTimeout = function () {
	            throw new Error('clearTimeout is not defined');
	        }
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var utils = __webpack_require__(9);
	var buildURL = __webpack_require__(13);
	var parseHeaders = __webpack_require__(14);
	var transformData = __webpack_require__(15);
	var isURLSameOrigin = __webpack_require__(16);
	var btoa = typeof window !== 'undefined' && window.btoa || __webpack_require__(17);
	var settle = __webpack_require__(18);

	module.exports = function xhrAdapter(resolve, reject, config) {
	  var requestData = config.data;
	  var requestHeaders = config.headers;

	  if (utils.isFormData(requestData)) {
	    delete requestHeaders['Content-Type']; // Let the browser set it
	  }

	  var request = new XMLHttpRequest();
	  var loadEvent = 'onreadystatechange';
	  var xDomain = false;

	  // For IE 8/9 CORS support
	  // Only supports POST and GET calls and doesn't returns the response headers.
	  // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	  if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined' && window.XDomainRequest && !('withCredentials' in request) && !isURLSameOrigin(config.url)) {
	    request = new window.XDomainRequest();
	    loadEvent = 'onload';
	    xDomain = true;
	  }

	  // HTTP basic authentication
	  if (config.auth) {
	    var username = config.auth.username || '';
	    var password = config.auth.password || '';
	    requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	  }

	  request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

	  // Set the request timeout in MS
	  request.timeout = config.timeout;

	  // For IE 9 CORS support.
	  request.onprogress = function handleProgress() {};
	  request.ontimeout = function handleTimeout() {};

	  // Listen for ready state
	  request[loadEvent] = function handleLoad() {
	    if (!request || request.readyState !== 4 && !xDomain) {
	      return;
	    }

	    // The request errored out and we didn't get a response, this will be
	    // handled by onerror instead
	    if (request.status === 0) {
	      return;
	    }

	    // Prepare the response
	    var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	    var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	    var response = {
	      data: transformData(responseData, responseHeaders, config.transformResponse),
	      // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
	      status: request.status === 1223 ? 204 : request.status,
	      statusText: request.status === 1223 ? 'No Content' : request.statusText,
	      headers: responseHeaders,
	      config: config,
	      request: request
	    };

	    settle(resolve, reject, response);

	    // Clean up request
	    request = null;
	  };

	  // Handle low level network errors
	  request.onerror = function handleError() {
	    // Real errors are hidden from us by the browser
	    // onerror should only fire if it's a network error
	    reject(new Error('Network Error'));

	    // Clean up request
	    request = null;
	  };

	  // Handle timeout
	  request.ontimeout = function handleTimeout() {
	    var err = new Error('timeout of ' + config.timeout + 'ms exceeded');
	    err.timeout = config.timeout;
	    err.code = 'ECONNABORTED';
	    reject(err);

	    // Clean up request
	    request = null;
	  };

	  // Add xsrf header
	  // This is only done if running in a standard browser environment.
	  // Specifically not if we're in a web worker, or react-native.
	  if (utils.isStandardBrowserEnv()) {
	    var cookies = __webpack_require__(19);

	    // Add xsrf header
	    var xsrfValue = config.withCredentials || isURLSameOrigin(config.url) ? cookies.read(config.xsrfCookieName) : undefined;

	    if (xsrfValue) {
	      requestHeaders[config.xsrfHeaderName] = xsrfValue;
	    }
	  }

	  // Add headers to the request
	  if ('setRequestHeader' in request) {
	    utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	      if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	        // Remove Content-Type if data is undefined
	        delete requestHeaders[key];
	      } else {
	        // Otherwise add header to the request
	        request.setRequestHeader(key, val);
	      }
	    });
	  }

	  // Add withCredentials to request if needed
	  if (config.withCredentials) {
	    request.withCredentials = true;
	  }

	  // Add responseType to request if needed
	  if (config.responseType) {
	    try {
	      request.responseType = config.responseType;
	    } catch (e) {
	      if (request.responseType !== 'json') {
	        throw e;
	      }
	    }
	  }

	  // Handle progress if needed
	  if (config.progress) {
	    if (config.method === 'post' || config.method === 'put') {
	      request.upload.addEventListener('progress', config.progress);
	    } else if (config.method === 'get') {
	      request.addEventListener('progress', config.progress);
	    }
	  }

	  if (requestData === undefined) {
	    requestData = null;
	  }

	  // Send the request
	  request.send(requestData);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(9);

	function encode(val) {
	  return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+').replace(/%5B/gi, '[').replace(/%5D/gi, ']');
	}

	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }

	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else {
	    var parts = [];

	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }

	      if (utils.isArray(val)) {
	        key = key + '[]';
	      }

	      if (!utils.isArray(val)) {
	        val = [val];
	      }

	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });

	    serializedParams = parts.join('&');
	  }

	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }

	  return url;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(9);

	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;

	  if (!headers) {
	    return parsed;
	  }

	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));

	    if (key) {
	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	    }
	  });

	  return parsed;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(9);

	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });

	  return data;
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(9);

	module.exports = utils.isStandardBrowserEnv() ?

	// Standard browser envs have full support of the APIs needed to test
	// whether the request URL is of the same origin as current location.
	function standardBrowserEnv() {
	  var msie = /(msie|trident)/i.test(navigator.userAgent);
	  var urlParsingNode = document.createElement('a');
	  var originURL;

	  /**
	  * Parse a URL to discover it's components
	  *
	  * @param {String} url The URL to be parsed
	  * @returns {Object}
	  */
	  function resolveURL(url) {
	    var href = url;

	    if (msie) {
	      // IE needs attribute set twice to normalize properties
	      urlParsingNode.setAttribute('href', href);
	      href = urlParsingNode.href;
	    }

	    urlParsingNode.setAttribute('href', href);

	    // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	    return {
	      href: urlParsingNode.href,
	      protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	      host: urlParsingNode.host,
	      search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	      hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	      hostname: urlParsingNode.hostname,
	      port: urlParsingNode.port,
	      pathname: urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
	    };
	  }

	  originURL = resolveURL(window.location.href);

	  /**
	  * Determine if a URL shares the same origin as the current location
	  *
	  * @param {String} requestURL The URL to test
	  * @returns {boolean} True if URL shares the same origin, otherwise false
	  */
	  return function isURLSameOrigin(requestURL) {
	    var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
	    return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
	  };
	}() :

	// Non standard browser envs (web workers, react-native) lack needed support.
	function nonStandardBrowserEnv() {
	  return function isURLSameOrigin() {
	    return true;
	  };
	}();

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error();
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';

	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	  // initialize result and counter
	  var block, charCode, idx = 0, map = chars;
	  // if the next str index does not exist:
	  //   change the mapping table to "="
	  //   check if d has no fractional digits
	  str.charAt(idx | 0) || (map = '=', idx % 1);
	  // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	  output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}

	module.exports = btoa;

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */

	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(response);
	  }
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(9);

	module.exports = utils.isStandardBrowserEnv() ?

	// Standard browser envs support document.cookie
	function standardBrowserEnv() {
	  return {
	    write: function write(name, value, expires, path, domain, secure) {
	      var cookie = [];
	      cookie.push(name + '=' + encodeURIComponent(value));

	      if (utils.isNumber(expires)) {
	        cookie.push('expires=' + new Date(expires).toGMTString());
	      }

	      if (utils.isString(path)) {
	        cookie.push('path=' + path);
	      }

	      if (utils.isString(domain)) {
	        cookie.push('domain=' + domain);
	      }

	      if (secure === true) {
	        cookie.push('secure');
	      }

	      document.cookie = cookie.join('; ');
	    },

	    read: function read(name) {
	      var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	      return match ? decodeURIComponent(match[3]) : null;
	    },

	    remove: function remove(name) {
	      this.write(name, '', Date.now() - 86400000);
	    }
	  };
	}() :

	// Non standard browser env (web workers, react-native) lack needed support.
	function nonStandardBrowserEnv() {
	  return {
	    write: function write() {},
	    read: function read() {
	      return null;
	    },
	    remove: function remove() {}
	  };
	}();

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(9);

	function InterceptorManager() {
	  this.handlers = [];
	}

	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};

	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};

	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};

	module.exports = InterceptorManager;

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */

	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return (/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
	  );
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */

	module.exports = function combineURLs(baseURL, relativeURL) {
	  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */

	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};

/***/ },
/* 25 */
/***/ function(module, exports) {

	/* eslint no-console: ["error", { allow: ["info"] }] */
	'use strict';
	/*
	 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
	 * See LICENSE for more information
	 */

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var UDCConnection = exports.UDCConnection = function () {
	  _createClass(UDCConnection, [{
	    key: '_isData',
	    value: function _isData(session) {
	      return !session.audio && !session.video && !session.screen && session.data;
	    }
	  }]);

	  function UDCConnection(conn, connectCallback) {
	    var _this = this;

	    _classCallCheck(this, UDCConnection);

	    var connection = conn;

	    connection.socket = connection.bosh; // set here, can't set on caller

	    connection.socket.onmessage = function (uid, data) {
	      console.info(data.eventName + ' received');
	      if (data.eventName === connection.socketMessageEvent) {
	        connection.socket.onMessagesCallback(data.data);
	      }
	    };

	    connection.socket.onMessagesCallback = function (message) {
	      var myJid = connection.userid.replace(/@/g, '\\40');
	      var toJid = message.remoteUserId.replace(/@/g, '\\40');
	      if (myJid !== toJid) return;

	      var senderPeer = connection.peers[message.sender];
	      if (senderPeer && senderPeer.extra !== message.extra) {
	        senderPeer.extra = message.extra;
	        connection.onExtraDataUpdated({ userid: message.sender, extra: message.extra });
	      }

	      if (message.message.streamSyncNeeded && senderPeer) {
	        console.info('streamSyncNeeded NOT SUPPORTED');
	        return;
	      }

	      if (message.message === 'connectWithAllParticipants') {
	        console.info('connectWithAllParticipants NOT SUPPORTED');
	        return;
	      }

	      if (message.message === 'removeFromBroadcastersList') {
	        console.info('removeFromBroadcastersList NOT SUPPORTED');
	        return;
	      }

	      if (message.message === 'dropPeerConnection') {
	        console.info('dropPeerConnection NOT SUPPORTED');
	        return;
	      }

	      if (message.message.allParticipants) {
	        console.info('allParticipants NOT SUPPORTED');
	        return;
	      }

	      if (message.message.newParticipant) {
	        console.info('newParticipant NOT SUPPORTED');
	        return;
	      }

	      if (message.message.readyForOffer || message.message.addMeAsBroadcaster) {
	        connection.addNewBroadcaster(message.sender);
	      }

	      if (message.message.newParticipationRequest && message.sender !== connection.userid) {
	        var _ret = function () {
	          if (senderPeer) connection.deletePeer(message.sender);

	          var offerAudio = connection.sdpConstraints.mandatory.OfferToReceiveAudio;
	          var offerVideo = connection.sdpConstraints.mandatory.OfferToReceiveVideo;
	          var ses = connection.session;
	          var msg = message.message;
	          var noRemoteSdp = { OfferToReceiveAudio: offerAudio, OfferToReceiveVideo: offerVideo };
	          var oneLocalSdp = { OfferToReceiveAudio: !!ses.audio, OfferToReceiveVideo: !!ses.video };
	          var noLocalSdp = ses.oneway ? oneLocalSdp : noRemoteSdp;
	          var rOneWay = !!ses.oneway || connection.direction === 'one-way';
	          var noNeedRemoteStream = typeof msg.isOneWay !== 'undefined' ? msg.isOneWay : rOneWay;

	          var userPref = {
	            extra: message.extra || {},
	            localPeerSdpConstraints: msg.remotePeerSdpConstraints || noRemoteSdp,
	            remotePeerSdpConstraints: msg.localPeerSdpConstraints || noLocalSdp,
	            isOneWay: noNeedRemoteStream,
	            dontGetRemoteStream: noNeedRemoteStream,
	            isDataOnly: typeof msg.isDataOnly !== 'undefined' ? msg.isDataOnly : _this._isData(ses),
	            dontAttachLocalStream: !!msg.dontGetRemoteStream,
	            connectionDescription: message,
	            successCallback: function successCallback() {
	              if (noNeedRemoteStream || rOneWay || _this._isData(connection.session)) {
	                connection.addNewBroadcaster(message.sender, userPref);
	              }
	            }
	          };
	          connection.onNewParticipant(message.sender, userPref);
	          return {
	            v: void 0
	          };
	        }();

	        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	      }

	      if (message.message.shiftedModerationControl) {
	        console.info('shiftedModerationControl NOT SUPPORTED');
	        return;
	      }

	      if (message.message.changedUUID) {
	        console.info('changedUUID NOT SUPPORTED');
	        // no return
	      }

	      if (message.message.userLeft) {
	        connection.multiPeersHandler.onUserLeft(message.sender);
	        if (!!message.message.autoCloseEntireSession) {
	          connection.leave();
	        }
	        return;
	      }

	      connection.multiPeersHandler.addNegotiatedMessage(message.message, message.sender);
	    };

	    connection.socket.emit = function (eventName, data, callback) {
	      if (eventName === 'changed-uuid') return;
	      if (eventName === 'message') {
	        // data:uid, callback:data on boshclient
	        connection.socket.onmessage(data, JSON.parse(callback));
	        return;
	      }
	      if (typeof data === 'undefined') return;
	      if (data.message && data.message.shiftedModerationControl) return;

	      if (eventName === 'disconnect-with') {
	        if (connection.peers[data]) {
	          connection.peers[data].peer.close();
	        }
	        return;
	      }
	      connection.socket.send(data.remoteUserId, JSON.stringify({ eventName: eventName, data: data }));
	      console.info(eventName + ' sended');
	      if (callback) {
	        callback();
	      }
	    };
	    connectCallback(connection.socket);
	  }

	  return UDCConnection;
	}();

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* global m */
	'use strict';

	/**
	 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
	 * See LICENSE for more information
	 */

	var App = __webpack_require__(1).App;
	var ThetaView = __webpack_require__(27).ThetaView;

	var thetaview = new ThetaView();

	var login = {};
	login.vm = function () {
	  var vm = {};
	  vm.init = function (app, cb) {
	    vm._app = app;

	    vm.cameras = [];
	    vm.camstate = m.prop('loading');

	    vm.login = function () {
	      cb(false);
	      vm._app.connect().then(function () {
	        return cb(true);
	      }).catch(function () {
	        return cb(false);
	      });
	    };

	    vm.updateSelect = function (evt) {
	      vm._app.camid(evt.target.value);
	    };

	    vm._app.list(function (cameras) {
	      // todo on access error
	      vm.cameras = cameras;
	      if (vm._app.isOneWay) {
	        vm.camstate('oneway');
	      } else {
	        vm.camstate(vm.cameras.length === 0 ? 'nocam' : 'ready');
	      }
	      cb(false);
	    });
	  };
	  return vm;
	}();

	login.controller = function ctrl() {
	  this.app = App.getInstance();
	  this.vm = login.vm;

	  login.vm.init(this.app, function (done) {
	    m.redraw();
	    if (done) {
	      m.route('/streaming/vchat');
	    }
	  });
	};

	login.view_cam = function (vm, camstate, isFireFox) {
	  var confirm = m('p', 'Please click `allow` on the top of the screen, ' + 'so we can access your webcam for calls.');

	  if (camstate === 'oneway' || isFireFox) {
	    return undefined;
	  }
	  if (camstate === 'nocam') {
	    return [confirm, m('p', { class: 'err' }, 'No cameras.')];
	  }
	  if (camstate === 'fail') {
	    return [confirm, m('p', { class: 'err' }, 'Failed to access the webcam. Make sure to run this demo on an' + 'http server and click allow when asked for permission by the browser.')];
	  }
	  if (camstate === 'loading') {
	    return m('span', { class: 'glyphicon glyphicon-refresh glyphicon-spin' });
	  }
	  return m('div', { class: 'form-group' }, [m('label', { for: 'inputcam' }, 'WebCam:'), m('div', { class: 'input-group' }, [m('span', { class: 'input-group-addon' }, m('span', { class: 'glyphicon glyphicon-facetime-video' })), m('select', { id: 'inputcam', class: 'form-control', onchange: vm.updateSelect }, vm.cameras.map(function (cam) {
	    return m('option', { value: cam.id }, cam.label);
	  }))])]);
	};

	login.view_connect = function (vm, camstate, constate) {
	  if (camstate !== 'ready' && camstate !== 'oneway') return undefined;

	  var loginButton = constate === 'connecting' ? m('span', { class: 'glyphicon glyphicon-refresh glyphicon-spin' }) : m('button', { class: 'btn btn-success btn-block', onclick: vm.login }, 'Login');

	  var errmsg = constate === 'fail' ? m('p', { class: 'err' }, 'Login failed.') : undefined;

	  return [loginButton, errmsg];
	};

	login.view = function (ctrl) {
	  var app = ctrl.app;
	  var vm = ctrl.vm;

	  return m('div', { class: 'form-login panel panel-default' }, [m('div', { class: 'panel-body' }, [m('h2', 'Video streaming sample'), m('div', { class: 'form-group' }, [m('label', { for: 'inputuser' }, 'ID:'), m('div', { class: 'input-group' }, [m('span', { class: 'input-group-addon' }, m('span', { class: 'glyphicon glyphicon-user' })), m('input', {
	    type: 'text',
	    id: 'inputuser',
	    class: 'form-control',
	    placeholder: 'user@example.com',
	    required: ' ',
	    autofocus: ' ',
	    oninput: m.withAttr('value', app.username),
	    value: app.username()
	  })])]), m('div', { class: 'form-group' }, [m('label', { for: 'inputpass' }, 'Pass:'), m('div', { class: 'input-group' }, [m('span', { class: 'input-group-addon' }, m('span', { class: 'glyphicon glyphicon-lock' })), m('input', {
	    type: 'password',
	    id: 'inputpass',
	    class: 'form-control',
	    placeholder: '********',
	    required: ' ',
	    oninput: m.withAttr('value', app.userpass),
	    value: app.userpass()
	  })])]), login.view_cam(vm, vm.camstate(), app.isFirefox), login.view_connect(vm, vm.camstate(), app.state())])]);
	};

	var chat = {};
	chat.vm = function () {
	  var vm = {};
	  vm.init = function (app, cb) {
	    vm._app = app;

	    vm.isThetaView = m.prop(false);

	    vm.call = function () {
	      return vm._app.call();
	    };
	    vm.open = function () {
	      return vm._app.open();
	    };
	    vm.copy = function () {
	      return vm._app.copy();
	    };

	    vm.theta = function () {
	      return vm.isThetaView(!vm.isThetaView());
	    };

	    vm.logout = function () {
	      vm._app.disconnect();
	      cb(true);
	    };
	  };
	  return vm;
	}();

	chat.controller = function ctrl() {
	  this.app = App.getInstance();
	  if (this.app.state() === 'initial') {
	    m.route('/streaming');
	    return;
	  }
	  this.vm = chat.vm;

	  chat.vm.init(this.app, function (done) {
	    if (done) {
	      m.route('/streaming');
	    }
	  });
	};

	chat.startPeer = function (elm) {
	  thetaview.setContainer(elm);
	  thetaview.start(elm.firstChild);
	};

	chat.stopPeer = function (elm) {
	  thetaview.stop(elm.firstChild);
	};

	chat.view_peer = function (vm, app, constate) {
	  return constate !== 'chatting' ? undefined : [m('button', { class: 'btn btn-success btn-block', onclick: vm.theta }, 'Theta view'), m('div', { config: vm.isThetaView() ? chat.startPeer : chat.stopPeer }, [m('video', {
	    id: app.peerurlid(),
	    width: '100%',
	    height: '100%',
	    src: app.peerurl(),
	    mozSrcObject: app.peermoz(),
	    autoplay: ' '
	  })])];
	};

	chat.view_call = function (vm, constate) {
	  var connectButton = constate === 'calling' ? m('span', { class: 'glyphicon glyphicon-refresh glyphicon-spin' }) : m('button', { class: 'btn btn-success btn-block', onclick: vm.call }, 'Connect');
	  return constate === 'chatting' ? undefined : connectButton;
	};

	chat.view_connect = function (vm, app, constate) {
	  if (constate === 'chatready') return undefined;
	  return m('p', [m('div', { class: 'form-group' }, [m('label', { for: 'inputpeer' }, 'Peer-ID:'), m('div', { class: 'input-group' }, [m('span', { class: 'input-group-addon' }, m('span', { class: 'glyphicon glyphicon-user' })), m('input', {
	    type: 'text',
	    id: 'inputpeer',
	    class: 'form-control',
	    placeholder: 'user@example.com',
	    required: ' ',
	    autofocus: ' ',
	    oninput: m.withAttr('value', app.peername),
	    value: app.peername()
	  })])]), chat.view_call(vm, constate)]);
	};

	chat.view_my = function (app, constate) {
	  if (constate === 'ready' || app.isWatcher) return undefined;
	  return [m('div', { class: 'text-center' }, m('video', {
	    src: app.myurl(),
	    mozSrcObject: app.mymoz(),
	    width: 200,
	    height: 200,
	    autoplay: ' '
	  }))];
	};

	chat.view_open = function (vm, app, constate) {
	  if (constate !== 'ready') return undefined;
	  if (app.isOneWay) return undefined;
	  return m('button', { class: 'btn btn-success btn-block', onclick: vm.open }, 'Open');
	};

	chat.view = function (ctrl) {
	  var app = ctrl.app;
	  var vm = ctrl.vm;

	  return m('div', { class: 'row' }, [m('div', { class: 'col-md-9' }, chat.view_peer(vm, app, app.state())), m('div', { class: 'col-md-3' }, [m('div', { class: 'panel panel-default form-call' }, [m('p', [m('div', { class: 'form-group' }, [m('label', { for: 'inputmy' }, 'ID:'), m('div', { class: 'input-group' }, [m('input', {
	    type: 'text',
	    id: 'inputmy',
	    class: 'form-control',
	    readonly: ' ',
	    value: app.username()
	  }), m('span', { class: 'input-group-btn' }, m('button', { class: 'btn btn-default cpbtn', 'data-clipboard-target': '#inputmy' }, m('i', { class: 'glyphicon glyphicon-paperclip' })))])]), chat.view_open(vm, app, app.state())]), chat.view_connect(vm, app, app.state()), m('button', { class: 'btn btn-danger btn-block', onclick: vm.logout }, 'Logout'), chat.view_my(app, app.state())])])]);
	};

	module.exports.login = login;
	module.exports.chat = chat;

/***/ },
/* 27 */
/***/ function(module, exports) {

	/* global THREE */
	'use strict';

	/**
	 * Copyright (c) 2016 Ricoh Company, Ltd. All Rights Reserved.
	 * See LICENSE for more information
	 */

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ThetaView = function () {
	  _createClass(ThetaView, [{
	    key: '_cyln2world', //AZ EL => XYZ
	    value: function _cyln2world(a, e) {
	      return new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e));
	    }
	  }, {
	    key: '_world2fish',//XYZ => AZ,EL
	    value: function _world2fish(x, y, z) {
	      var nz = z;
	      if (z < -1.0) nz = -1.0;else if (z > 1.0) nz = 1.0;
	      return new THREE.Vector2(Math.atan2(y, x), Math.acos(nz) / Math.PI); // 0.0 to 1.0
	    }
	  }, {
	    key: '_calcTexUv', //AZ en El => x,y *** AZ en El => x,y,z => AZ, EL => x,y
	    value: function _calcTexUv(i, j, lens) { 
	      var world = this._cyln2world(((i + 90) / 180.0 - 1.0) * Math.PI, // rotate 90 deg for polygon
	      (0.5 - j / 180.0) * Math.PI);
	      var ar = this._world2fish(Math.sin(-0.5 * Math.PI) * world.z + Math.cos(-0.5 * Math.PI) * world.x, world.y, Math.cos(-0.5 * Math.PI) * world.z - Math.sin(-0.5 * Math.PI) * world.x);

	      // Ricoh Theta
		  var fishRad = 0.883;
	      var fishRad2 = fishRad * 0.88888888888888;
	      var fishCenter = 1.0 - 0.44444444444444;
	      var x = lens === 0 ? fishRad * ar.y * Math.cos(ar.x) * 0.5 + 0.25 : fishRad * (1.0 - ar.y) * Math.cos(-1.0 * ar.x + Math.PI) * 0.5 + 0.75;
		  
		  // Webcam 180°
		  // var fishRad = 1;
	      // var fishRad2 = fishRad * 1;
	      // var fishCenter = 1.0 - 0.5;
	      // //var x = lens === 0 ? fishRad * ar.y * Math.cos(ar.x) * 1 + 0.5 : fishRad * (1.0 - ar.y) * Math.cos(-1.0 * ar.x + Math.PI) * 1 + 0.5;
		  // var x = lens === 0 ? fishRad * (ar.y) * Math.cos(-1.0 * ar.x + Math.PI) * 1 + 0.5 : fishRad * (1.0 - ar.y) * Math.cos(-1.0 * ar.x + Math.PI) * 1 + 0.5;
	      
		  var y = lens === 0 ? fishRad2 * ar.y * Math.sin(ar.x) + fishCenter : fishRad2 * (1.0 - ar.y) * Math.sin(-1.0 * ar.x + Math.PI) + fishCenter;
	      return new THREE.Vector2(y,x);
	    }
	  }, {
	    key: '_createGeometry',
	    value: function _createGeometry() {
	      var geometry = new THREE.Geometry();

	      var uvs = [];
	      for (var j = 0; j <= 180; j += 5) {
	        for (var i = 0; i <= 360; i += 5) {
	          //geometry.vertices.push(new THREE.Vector3(Math.sin(Math.PI * j / 180.0) * Math.sin(Math.PI * i / 180.0) * 500.0, Math.cos(Math.PI * j / 180.0) * 500.0, Math.sin(Math.PI * j / 180.0) * Math.cos(Math.PI * i / 180.0) * 500.0));
			  geometry.vertices.push(new THREE.Vector3(Math.sin(Math.PI * j / 180.0) * Math.sin(Math.PI * i / 180.0) * 5.0, Math.cos(Math.PI * j / 180.0) * 5.0, Math.sin(Math.PI * j / 180.0) * Math.cos(Math.PI * i / 180.0) * 5.0));
			  
	        }
	        /* divide texture */
	         for (var k = 0; k <= 180; k += 5) { 
	           uvs.push(this._calcTexUv(k, j, 0));

	         }
	        for (var l = 180; l <= 360; l += 5) {
	          uvs.push(this._calcTexUv(l, j, 1));
	        }
	      }

	      for (var m = 0; m < 36; m++) {
	        for (var n = 0; n < 72; n++) {
	          var v = m * 73 + n;
	          geometry.faces.push(new THREE.Face3(v + 0, v + 1, v + 73, null, null, 0), new THREE.Face3(v + 1, v + 74, v + 73, null, null, 0));
	          var t = n < 36 ? m * 74 + n : m * 74 + n + 1;

	          geometry.faceVertexUvs[0].push([uvs[t + 0], uvs[t + 1], uvs[t + 74]], [uvs[t + 1], uvs[t + 75], uvs[t + 74]]);
	        }
	      }
	      geometry.scale(-1, 1, 1); // rotate left-right
	      return geometry;
	    }
	  }, {
	    key: '_createMaterial',
	    value: function _createMaterial(video) {
	      // video:DOM
	      var texture = new THREE.VideoTexture(video);
	      //texture.minFilter = THREE.LinearFilter;
		  texture.minFilter = THREE.LinearMipMapNearestFilter
	      //texture.magFilter = THREE.LinearFilter;
		  texture.magFilter = THREE.LinearMipMapNearestFilter;
	       return new THREE.MeshBasicMaterial({
	        map: texture,
	         side: THREE.BackSide
			// wireframe: true
			// ,color: 0xF04040
	       });
		  
		  // return new THREE.MeshBasicMaterial( {
						// color: 0xff4f4f,
						// side: THREE.BackSide,
						// opacity: 0.2,
						// wireframe: true,
		  // transparent: true});
		  //return new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) 
	    }
	  }, {
	    key: '_animate',
	    value: function _animate() {
	      this._timer = requestAnimationFrame(this._animate.bind(this));
	      if (this._camera === null) return;

	       this._lat = Math.max(-85, Math.min(85, this._lat));
	       var phi = THREE.Math.degToRad(90 - this._lat);
	       var theta = THREE.Math.degToRad(this._lon);
	       this._camera.target.x =   5 * Math.sin(phi) * Math.cos(theta);
	       this._camera.target.y =  5 * Math.cos(phi);
	       this._camera.target.z = 5 * Math.sin(phi) * Math.sin(theta);
	       this._camera.lookAt(this._camera.target);
	      // //this._renderer.render(this._scene, this._camera);
		  
		  this._controls.update();
		  this._effect.render( this._scene, this._camera );
	    }
	  }, {
	    key: '_onWheel',
	    value: function _onWheel(e) {
	      if (!e) return;
	      if (e.preventDefault) e.preventDefault();
	      var k = this._isChrome ? 0.05 : 1.0;
	      this._camera.fov += e.deltaY * k;
	      this._camera.updateProjectionMatrix();
	    }
	  }, {
	    key: '_onMouseUp',
	    value: function _onMouseUp(e) {
	      if (!e) return;
	      if (e.preventDefault) e.preventDefault();
	      this._isUserInteracting = false;
	    }
	  }, {
	    key: '_onTouchEnd',
	    value: function _onTouchEnd(e) {
	      this._onMouseUp(e.touches[0]);
	      return false;
	    }
	  }, {
	    key: '_onMouseDown',
	    value: function _onMouseDown(e) {
	      if (!e) return;
	      if (e.preventDefault) e.preventDefault();
	      this._isUserInteracting = true;
	      this._onPointerDownPointerX = e.clientX;
	      this._onPointerDownPointerY = e.clientY;
	      this._onPointerDownLon = this._lon;
	      this._onPointerDownLat = this._lat;
	    }
	  }, {
	    key: '_onTouchStart',
	    value: function _onTouchStart(e) {
	      this._onMouseDown(e.touches[0]);
	      return false;
	    }
	  }, {
	    key: '_onMove',
	    value: function _onMove(e, d) {
	      if (!this._isUserInteracting) return;
	      this._lon = (this._onPointerDownPointerX - e.clientX) * d + this._onPointerDownLon;
	      this._lat = (e.clientY - this._onPointerDownPointerY) * d + this._onPointerDownLat;
	    }
	  }, {
	    key: '_onMouseMove',
	    value: function _onMouseMove(e) {
	      if (!e) return;
	      if (e.preventDefault) e.preventDefault();
	      this._onMove(e, 0.1);
	    }
	  }, {
	    key: '_onTouchMove',
	    value: function _onTouchMove(e) {
	      if (!e) return false;
	      if (e.preventDefault) e.preventDefault();
	      this._onMove(e.touches[0], 1.0);
	      return false;
	    }
	  }]);

	  function ThetaView() {
	    _classCallCheck(this, ThetaView);

	    this._isUserInteracting = false;
	    this._lon = 0;
	    this._lat = 0;
	    this._onPointerDownPointerX = 0;
	    this._onPointerDownPointerY = 0;
	    this._onPointerDownLon = 0;
	    this._onPointerDownLat = 0;
	    this._camera = null;
	    this._scene = null;
	    this._renderer = null;
	    this._container = undefined;
	    this._timer = undefined;
	    var ua = window.navigator.userAgent.toLowerCase();
	    this._isChrome = ua.indexOf('chrome') !== -1;
	  }

	  _createClass(ThetaView, [{
	    key: 'start',
	    value: function start(videoDOM) {
	      if (!this._container) return;
	      if (this._timer) return;
	      var w = this._container.clientWidth;
	      var h = this._container.clientHeight;

	      // create Camera
	      this._camera = new THREE.PerspectiveCamera(75, w / h, 1, 1100);
	      this._camera.target = new THREE.Vector3(0, 0, 0);

	      // create Scene
	      this._scene = new THREE.Scene();
	      this._scene.add(new THREE.Mesh(this._createGeometry(), this._createMaterial(videoDOM)));

	      // create Renderer
	      this._renderer = new THREE.WebGLRenderer();
	      this._renderer.setPixelRatio(window.devicePixelRatio);
	      this._renderer.setSize(w, h);
		  
		  this._controls = new THREE.VRControls( this._camera );
		  this._effect = new THREE.VREffect( this._renderer );

				//if ( WEBVR.isAvailable() === true ) {

					document.body.appendChild( WEBVR.getButton( this._effect ) );

				//}
		  this._crosshair = new THREE.Mesh(
					new THREE.RingGeometry( 2, 4, 32 ),
					new THREE.MeshBasicMaterial( {
						color: 0xff4f4f,
						opacity: 0.5,
						transparent: true
					} )
				);
				this._crosshair.position.z = 2;
				this._camera.add( this._crosshair );
				
				var geometry = new THREE.BoxGeometry( 15, 15, 15 );

				var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
				this._camera.add( object );
				
				
				// var light = new THREE.DirectionalLight( 0xffffff );
				// light.position.set( 1, 1, 1 ).normalize();
				// this._scene.add( light );

				// var light = new THREE.DirectionalLight( 0xffffff );
				// light.position.set( 100, 100, 100 ).normalize();
				// this._scene.add( light );

				
				
				var room = new THREE.Mesh(
					new THREE.BoxGeometry( 6, 6, 6, 8, 8, 8 ),
					new THREE.MeshBasicMaterial( { color: 0x404040, wireframe: true } )
				);
				//this._scene.add( room );

				// this._scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

				// var light = new THREE.DirectionalLight( 0xffffff );
				// light.position.set( 1, 1, 1 ).normalize();
				// this._scene.add( light );

					var object = new THREE.Mesh( new THREE.BoxGeometry( 0.15, 0.15, 0.15 ), new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

					object.position.x = Math.random() * -2;
					object.position.y = Math.random() * 2;
					object.position.z = Math.random() * 2;

					object.rotation.x = Math.random() * 2 * Math.PI;
					object.rotation.y = Math.random() * 2 * Math.PI;
					object.rotation.z = Math.random() * 2 * Math.PI;

					object.scale.x = Math.random() + 0.5;
					object.scale.y = Math.random() + 0.5;
					object.scale.z = Math.random() + 0.5;

					this._scene.add( object );

				
				
				
	      this._renderer.domElement.addEventListener('wheel', this._onWheel.bind(this), false);
	      this._renderer.domElement.addEventListener('mouseup', this._onMouseUp.bind(this), false);
	      this._renderer.domElement.addEventListener('mousedown', this._onMouseDown.bind(this), false);
	      this._renderer.domElement.addEventListener('mousemove', this._onMouseMove.bind(this), false);
	      this._renderer.domElement.addEventListener('touchend', this._onTouchEnd.bind(this), false);
	      this._renderer.domElement.addEventListener('touchstart', this._onTouchStart.bind(this), false);
	      this._renderer.domElement.addEventListener('touchmove', this._onTouchMove.bind(this), false);

	      this._container.appendChild(this._renderer.domElement);
	      var dom = videoDOM;
	      dom.style.display = 'none';
	      this._animate();
	    }
	  }, {
	    key: 'stop',
	    value: function stop(videoDOM) {
	      if (!this._timer) return;
	      cancelAnimationFrame(this._timer);
	      this._timer = undefined;

	      var child = this._container.lastChild;
	      if (child) this._container.removeChild(child);
	      var dom = videoDOM;
	      dom.style.display = 'block';
	    }
	  }, {
	    key: 'setContainer',
	    value: function setContainer(elm) {
	      var _this = this;

	      this._container = elm;
	      window.onresize = function () {
	        if (_this._camera === null) return;
	        var w = _this._container.clientWidth;
	        var ww = _this._renderer.domElement.width;
	        var hh = _this._renderer.domElement.height;
	        _this._camera.aspect = ww / hh;
	        _this._camera.updateProjectionMatrix();
	        _this._renderer.setSize(w, w / _this._camera.aspect);
	      };
	    }
	  }]);

	  return ThetaView;
	}();

	exports.ThetaView = ThetaView;

/***/ }
/******/ ])
});
;