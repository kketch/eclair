/**
 *
 *	Eclair.require()
 *
 */

 (function (Eclair, _) {

	/**
	 *  Eclair.require settings
	 *
	 *  @name Eclair.settings
	 *  @property {String} [settings.modulePath=/eclair-modules/] - Eclair.js modules path
	 *  @property {Boolean} [settings.cacheJavascript=true] - cache Eclair.require() requested ressources into the localStorage
	 */
	Eclair.settings.define({
		
		modulePath: "{{{ defaults.modulePath }}}",
		cacheJavascript: true
		
	});

	var location = Eclair.global.location,
	 	settings = Eclair.settings;

	 // Require log	
	Eclair._RL = [];

	/**
	 *  <p> Load a remote or relative javascript file, or a Eclair Module. </p>
	 *  <p> There is specific settings related to Eclair.require and its behaviour </p>
	 *
	 *  @param {String} module Eclair module name or url of the a script
	 *  @param {Function} callback function
	 *  @param {Function} onerror function called on error
	 *
	 *  @todo error handling for loading a js file or Eclair Module,
	 *  since the caching system, non-existent scripts are loaded
	 */
	Eclair.require = function (module, callback, onerror, opts) {
		
		opts = opts || {};
		opts.async = opts.async || true;

		if (typeof module == "object") {
			return massRequire(module, callback, onerror, opts);
		}

		if (module.indexOf('.js') >= 1 || opts.force) {

			return addScriptFromUrl(module, callback, onerror, opts);

		} else if (Eclair.isLoaded(module)) {

			var promise = new Eclair.Promise;

			return promise.done(null,null);

		} else {

			return Eclair.require(settings.modulePath + module + '.js', callback, onerror, opts);

		}

	}

	/**
	 *  Load some dependencies list,
	 *  see Eclair.Module documentation for more details
	 *
	 *  @method
	 *  @memberof Eclair
	 *  @param {Object} options Module collection to be loaded
	 *
	 *  @todo implement fallback method on the whole dependencies stack
	 */
	Eclair.load = function (options) {

		var loader = Eclair.require(options.dependencies);
		
		if (options.onload) {
		
			loader.then(options.onload);
		
		}

	}

	/**
	 *  Load many javascript files
	 *  called internally by Eclair.require
	 *
	 *  @param {Array} modules
	 *  @param {Function} callback
	 *  @param {Function} onerror
	 *  @param {Boolean} force
	 */
	var massRequire = function (modules, callback, onerror, opts) {

		var modulesTotal,
			modulesCount = modulesTotal = modules.length,
			modulesLoaded = 0,
			promise = new Eclair.Promise;

		var resolver = function (complete) {

			if (complete) {
			
				var err = null;
			
				if (modulesCount !== modulesTotal) {
			
					err = {};
					err.missing = modulesTotal - modulesCount;
			
				}
			
				promise.done(err, null);
			
			}

		}

		var _onLoad = function () {

			modulesLoaded++;
			
			var operationOver = modulesCount - modulesLoaded === 0 ? true : false;
			
			if (callback) {
				callback(operationOver, modulesLoaded, modulesCount)
			}
			
			resolver(operationOver);

		}

		var _onError = function () {

			modulesCount--;
			
			var operationOver = modulesCount - modulesLoaded === 0 ? true : false;
			
			if (onerror) {
				onerror(operationOver, modulesLoaded, modulesCount)
			}
			
			resolver(operationOver);

		}

		_.each(modules, function (module) {

			Eclair.require(module, _onLoad, _onError, opts);

		});

		return promise;

	 }

	/**
	 *  Add a script to the page
	 *
	 *  @param {String} scriptUrl
	 *  @param {Function} callback
	 *  @param {Function} onerror
	 */
	var addScriptFromUrl = function (scriptUrl, callback, onerror, opts) {

		var XHR = Eclair.XHR,
			log = Eclair._RL,
			LocalStorage = Eclair.LocalStorage,
			promise = new Eclair.Promise;

		// Check if the url is absolute
		if (!~scriptUrl.indexOf('http://') 
			&& !~scriptUrl.indexOf('https://')
			&& scriptUrl.substring(0,2) != '//') {
		
			// If it isn't we append the baseUrl
			// to ensure the identifier is correct in the localStorage
			scriptUrl = Eclair.Browser.getBaseUrl() + scriptUrl;
		
		}

		promise.on('success', callback);
		promise.on('error', onerror);

		// Can we use XHR to retrieve this script ?	
		if (settings.cacheJavascript 
			&& (XHR.canLoadURL(scriptUrl) || settings.xhrProxy)) {
		
			var cachedScript = LocalStorage.get(scriptUrl);
		
			if (cachedScript && LocalStorage.isValidStoreObject(cachedScript)) {
		
				log.push({res:scriptUrl, status:'local'});
		
				addInlineScript(cachedScript);
		
				// Success
				promise.done(null, null);
		
			} else {
		
				var scriptLoad = function (response) {
		
					log.push({res:scriptUrl, status:'net'});
		
					cachedScript = new LocalStorage.LocalStoreObject(response);
					LocalStorage.add(scriptUrl, cachedScript);
					addInlineScript(cachedScript);
		
					// Success
					promise.done(null, null);
		
				}
		
				var scriptError = function (status) {
		
					var e = {res:scriptUrl, status:status};
		
					log.push(e);
		
					// Error
					promise.done(e, null);
		
				}
		
				// Use the "proxy" if available
				Eclair.ajax({
					url: scriptUrl,
					success: scriptLoad,
					error: scriptError,
					proxy: true,
					async: opts.async,
					timeout: opts.timeout
				});
		
			}
		
		} else {
		
			var script = Eclair.document.createElement('script');
			script.type = "text/javascript";
			script.charset = "utf-8";
		
			if (opts.async) {
				script.async = true;
			}
		
			script.src = scriptUrl;
		
			script.addEventListener('load', function (e) {
		
				// Success
				promise.done(null, null);
		
			}, false);
		
			script.addEventListener('error', function (e) {
		
				// Error
				promise.done(e, null)
		
			})
		
			if (Eclair.document.body) {
				Eclair.document.body.appendChild(script);
			} else {
				Eclair.head.appendChild(script);	
			}
		
		}

		return promise;

	 }

	/**
	 *  Add a inline script from a LocalStoreObject
	 *
	 *  @param {Object} script
	 *  @param {Object} cachedScript LocalStore Object instance
	 */
	 var addInlineScript = function (cachedScript) {

		 var script = Eclair.document.createElement('script');
		 script.text = cachedScript.data;
		
		 Eclair.head.appendChild(script);

	 }

 })(Eclair, _);