/**
 * XHR.js
 *
 */

(function (Eclair, _) {

	var settings = Eclair.settings;

	/**
	 *  XHR Component settings
	 *
	 *  @name Eclair.settings
	 *  @property {String} [settings.xhrProxy] - XHR Proxy, mandatory if CORS isn't enabled on the remote server
	 */
	settings.define({ 
		xhrProxy: "{{{ defaults.xhrProxy }}}"
	});

	/**
	 *  <p> XHR Component</p>
	 *  <p> This compenent is a simple wrapper around XMLHttpRequest, it provides utility methods to
	 *  perform <strong>synchronous or asynchronous requests</strong>. </p>
	 *
	 *  @constructor
	 *  @memberof Eclair
	 *  
	 */
	var XHR = Eclair.Module('XHR', {

		inherit: Eclair.Promise,
		initializer: function (options) {

			if (!(this instanceof XHR)) {
				return;
			}

			if (!options) {
				options = {};
			}

			/**
			 *  HTTP method to use
			 *
			 *  @memberof Eclair.XHR
			 *  @name method
			 *  @instance
			 *  @type {String}
			 */
			this.method = options.method || 'GET';

			/**
			 *  <p>Can be set to change the response type.</p>
			 *  <p>Should not be used with synchronous requests.
			 *  But support is provided on synchronous requests
			 *  for "document" responseType</p>
			 *  <p>Ex: "document", "json", "blob", "arraybuffer"</p>
			 *
			 *  @memberof Eclair.XHR
			 *  @name responseType
			 *  @instance
			 *  @type {String}
			 */
			this.responseType = options.responseType || '';

			/**
			 *  URL of the ressource to request
			 *
			 *  @memberof Eclair.XHR
			 *  @name url
			 *  @instance
			 *  @type {String}
			 */
			this.url = options.url || null;

			/**
			 *  Query parameters
			 *
			 *  @memberof Eclair.XHR
			 *  @name data
			 *  @instance
			 *  @type {Object}
			 */
			this.data = options.data || {};

			/**
			 *  Additional headers to send
			 *
			 *  @memberof Eclair.XHR
			 *  @name headers
			 *  @instance
			 *  @type {Object}
			 */
			this.headers = options.headers || {};

			/**
			 *  When the set to true, the request is aborted
			 *  when the headers has been received.
			 *
			 *  @memberof Eclair.XHR
			 *  @name headersOnly
			 *  @instance
			 *  @type {Boolean}
			 */
			this.headersOnly = options.headersOnly || false;

			/**
			 *  When the set to false, the request will be
			 *  performed synchronously. (Careful, this lock the
			 *  whole page on Safari).
			 *
			 *  @memberof Eclair.XHR
			 *  @name async
			 *  @instance
			 *  @type {Boolean}
			 */
			this.async = _.isUndefined(options.async) ? true : options.async;

			/**
			 *  Set a timeout for request
			 *
			 *  @memberof Eclair.XHR
			 *  @name timeout
			 *  @instance
			 *  @type {Boolean|Number}
			 */
			this.timeout = options.timeout || false;

			/**
			 *  Response (defaults to null)
			 *  The response entity body according to responseType, as an ArrayBuffer,
			 *  Blob, Document, JavaScript object (for "json"), or string.
			 *  This is null if the request is not complete or was not successful.
			 *
			 *  @memberof Eclair.XHR
			 *  @name response
			 *  @instance
			 *  @type {Object|String|XMLDocument|HTMLDocument}
			 */
			this.response = null;

			/**
			 *  Response text (defaults to null)
			 *
			 *  @memberof Eclair.XHR
			 *  @name responseText
			 *  @instance
			 *  @type {String}
			 */
			this.responseText = null;

			// purposely undocumented
			this.payload = XHR.encodeURI(this.data);

			if (this.method === 'GET' && this.payload) {

				this.url += '?' + this.payload;
				this.payload = null;

			}

		}

	});

	var xhrProto = XHR.prototype;

	/**
	 *  <p> Convert a javascript object to a URI string </p>
	 *  <p> eg: {name:'Avo',age:6} becomes the string: &name=avo&age=6 </p>
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @param {Object} data Data object to encode
	 *  @returns {String}
	 */
	XHR.encodeURI = function (data) {

		var result = "";

		if (_.isString(data)) {

			result = data;

		} else {

			var e = encodeURIComponent;

			for (var k in data) {

				if (data.hasOwnProperty(k)) {
					result += (!result ? '' : '&') + e(k) + '=' + e(data[k]);
				}

			}

		}

		return result;

	}

	/**
	 *  Return true if XHR can load this url without encountering
	 *  cross origin request security issues
	 *
	 *  @param {String} url The url
	 */
	XHR.canLoadURL = function (url) {

		if (url.indexOf(location.origin) === 0
			|| location.protocol === 'applewebdata:'
		) {

			return true;

		}

		return false;

	}

	/**
	 *  Track method, abort the HTTP request when the
	 *  headers has been received (it means that it don't
	 *  waste time retrieving unused additional data)
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @param {String} url Url to "touch"
	 *  @param {Boolean} [async=true] whether the tracking operation should be asynchronous
	 *
	 *  @todo use a Image.src loader with cross origin request
	 */
	XHR.track = function (url, callback) {
		
		var options = {
		
			headersOnly: true
		
		};
		
		if (callback === false) {
			
			options.async = false;
			
		}
		
		return this.get(url, options)

	}

	/**
	 *  Factory method to create Eclair.XHR requests
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @param {Object} options Options to instantiate Eclair.XHR
	 *  @param {Function} callback Callback to be triggered when the request is over.
	 */
	XHR.createRequest = function (options, callback) {

		return (new XHR(options)).then(callback).send();

	}

	// HTTP verbs methods START

	/**
	 *  Perform a HTTP GET request
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @name get
	 *  @param {String} url Request url
	 *  @param {Function} callback Callback to be triggered when the request is over.
	 *  @param {Object} [options] Options to instantiate Eclair.XHR
	 */
	/**
	 *  Perform a HTTP POST request
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @name post
	 *  @param {String} url Request url
	 *  @param {Function} callback Callback to be triggered when the request is over.
	 *  @param {Object} [options] Options to instantiate Eclair.XHR
	 */
	/**
	 *  Perform a HTTP PUT request
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @name put
	 *  @param {String} url Request url
	 *  @param {Function} callback Callback to be triggered when the request is over.
	 *  @param {Object} [options] Options to instantiate Eclair.XHR
	 */
	/**
	 *  Perform a HTTP DELETE request
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @name delete
	 *  @param {String} url Request url
	 *  @param {Function} callback Callback to be triggered when the request is over.
	 *  @param {Object} [options] Options to instantiate Eclair.XHR
	 */

	var methods = [
		'get',
		'post',
		'put',
		'delete'
	];

	_.each(methods, function (method) {

		XHR[method] = function (url, callback, options) {

			options = options || {};
			options.url = url;
			options.method = method.toUpperCase();

			return this.createRequest(options, callback);

		}

	})
	// HTTP verbs methods STOP

	// public but undocumented
	xhrProto.xhr = function () {

		if (!this._xhr) {

			try {

				this._xhr = new XMLHttpRequest;

			} catch (e) {

				this.done(e, null);
				return null;

			}

		}

		return this._xhr;

	}

	/**
	 *  Send the request
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @name send
	 *  @instance
	 */
	xhrProto.send = function () {

		var xhr = this.xhr(),
			self = this;

		xhr.open(this.method, this.url, this.async);


		// A specific responseType has been specified
		if (this.responseType && this.async) {
			
			try {
				
				xhr.responseType = this.responseType;
				
			} catch (e) {}
			
		}

		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		_.each(this.headers, function (content, name) {

			xhr.setRequestHeader(name, content);

		});

		if (this.timeout) {

			function onTimeout () {

				self.abort();
				self.done({timeout: true}, null);

			}

			var timer = setTimeout(onTimeout, this.timeout);

		}
		
		xhr.onerror = function (e) {
			
			if (self.pending) {
				
				self.done(e, null);
				
			}
			
		}

		xhr.onreadystatechange = function () {

			if (self.timeout) {

				clearTimeout(timer);

			}

			if (self.headersOnly && xhr.readyState >= 2) {

				self.abort();
				self.done(null, xhr.responseText);
				self.response = xhr.response;
				self.responseText = xhr.responseText;
				return;

			}

			if (xhr.readyState === 4) {

				// Fill response member and:
				// enable document responseType on synchronous requests
				self.response = !self.async && self.responseType === 'document' ? 
								(new DOMParser).parseFromString(xhr.responseText, "text/html") : (xhr.response || xhr.responseText);

				if (!self.responseType) {

					self.responseText = xhr.responseText;

				} else if (self.responseType === 'json' && _.isString(self.response)) {

					// Enable json responseType on synchronous requests
					self.response = JSON.parse(self.response);

				}

				if ( (xhr.status >= 200 && xhr.status < 300) 
					 || xhr.status == 304 
					 || (xhr.status === 0 && xhr.protocol && -1 != xhr.protocol.indexOf('http')) 
				   ) 
				{

					self.done(null, self.response);	

				} else {

					self.done(xhr.status, self.response);

				}

			}

		}

		xhr.send(this.payload);

		return this;

	}

	/**
	 *  Abort the request
	 *
	 *  @method
	 *  @memberof Eclair.XHR
	 *  @name abort
	 *  @instance
	 */
	xhrProto.abort = function () {

		return this;

	}

	/**
	 *  jQuery-like ajax method
	 *
	 *  @param {Object} options Request options
	 *  @param {String} [options.type=GET] HTTP method to be used. Ex: "GET"
	 *  @param {String} options.url request url
	 *  @param {Boolean} [options.async=true] Should the be synchronous or asynchronous ?
	 *  @param {Function} [options.success=false] A success callback, it receives the response text as its first argument, the second is the XMLHttpRequest instance used
	 *  @param {Function} [options.error=false] A error callback, it receives the status text as its first argument, then the XMLHttpRequest
	 *  @param {String} [options.proxy] A intermediate "proxy" to be used, this string is simply prepended to the request url.
	 *  @param {Number} [options.timestamp=false] Should a timestamp be appended to the request url to prevent caching ?
	 *
	 *  @example Eclair.ajax({
	 *  	type: 'GET',
	 *  	url: 'http://foo.com/bar',
	 *  	success: function (response) {
	 *  		console.log('The response is ', response)
	 *  	},
	 *  	error: function (status) {
	 *  		console.log('Error: ', status)
	 *  	}
	 *  });
	 */
	Eclair.ajax = function (options) {

		if (!options) return;

		if (options.timestamp) {

			var ts = +new Date;

			if (!options.data) {
				options.data = {};
			}

			options.data.ts = ts;
		}

		var req = new XHR(options);

		if (options.proxy) {

			var proxy = _.isBoolean(options.proxy) ? settings.xhrProxy : options.proxy;

			req.url = proxy + req.url;

		}

		if (options.success) {

			req.on('success', options.success);

		}

		if (options.error) {

			req.on('error', options.error);

		}

		req.send();

		return req;

	}

})(Eclair, _);