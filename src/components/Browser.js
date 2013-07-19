/**
 *  Browser.js
 *
 */

(function (Eclair, _) {

	var settings = Eclair.settings,
		w = Eclair.global,
		userAgent = w.navigator.userAgent;

	/**
	 *  <p> Browser Component </p>
	 *  <p> Provide a set of utility to manage the browser </p>
	 *  <p> Browser.name provide an identifier for the current platform such as 'ios', 'android',
	 *  or 'webkit' </p>
	 *  <h4> Detect iOS or Android: </h4>
	 *  <p> The Browser component has theses members: Browser.ios, Browser.android
	 *  Browser.webkit which allow us to determine which browser we're running on.
	 *  These parameters will be false if the browser don't match or will provide an object
	 *  that contains the name, version, fullName and fullVersion of the browser. </p>
	 *
	 *  @class
	 *  @memberof Eclair
	 *  @todo Provide support for other mobile platforms in the future, only iOS and Android are supported right now
	 *
	 *  @example var browser = Eclair.Browser;
	 *  // This condition will match iOS5+:
	 *  if (browser.ios && browser.ios.version >= 5) {
	 *      console.log('We are on iOS5+');
	 *  } else {
	 *      console.log('This an outdated iOS version');
	 *  }
	 *
	 *  // Something similar for Android :
	 *  if (browser.android && browser.android.fullVersion < 2.3) {
	 *      console.log('Very old phone!');
	 *  }
	 *
	 */
	var Browser = Eclair.Module('Browser', {
		initializer: {}
	});

	function Navigator (members) {

		_.extend(this, members);

	}

	/**
	 *  <p> Provide an identifier for the browser,
	 *  <strong> can return 'ios', 'android', 'webkit' or false. </strong> </p>
	 *  <p> Webkit is only returned when ios nor android has been detected. </p>
	 *
	 *  @memberof Eclair.Browser
	 *  @type {String} 
	 */
	Browser.name = null;

	/**
	 *  Contain a full browser name extracted from the userAgent
	 *
	 *  @memberof Eclair.Browser
	 *  @type {String}
	 */
	Browser.fullName = null;

	/**
	 *  <p> Return a version number parsed from the userAgent </p>
	 *  <p> Will return 4 for iOS 4, 6 for iOS 6, 2 and 4 for Android
	 *  2 & 4 etc. </p>
	 *
	 *  @memberof Eclair.Browser
	 *  @type {String}
	 */
	Browser.version = null;

	/**
	 *  <p> Return a long version number parsed from the userAgent </p>
	 *
	 *  @memberof Eclair.Browser
	 *  @type {String}
	 */
	Browser.fullVersion = null;

	/**
	 *  Accept a list (Array) or a single regex or string,
	 *  and use String.prototype.match to test the userAgent
	 *  of the WebView/Browser
	 *
	 *  @memberof Eclair.Browser
	 *  @param {RegExp|String|Array} regex Regex or array of regex, or string to use
	 *
	 *  @returns {Array|null}
	 *
	 */
	Browser.match = function (regex) {

		var result;

		if (_.isArray(regex)) {

			for (var i = 0; i < regex.length; i++) {

				result = userAgent.match(regex[i])

				if (result) {
					return result;
				}

			}

			return result;

		} else {

			return userAgent.match(regex);

		}

	}

	/**
	 *  <p> Register a new browser check and apply it immediately on the Browser object </p>
	 *  <p> Careful, if there is a match, the information at Browser.name, Browser.version etc
	 *  will be overriden. </p>
	 *
	 *  @memberof Eclair.Browser
	 *  @param {String} name This identifier will be used to create the test and registed at Eclair.Browser[name]
	 *  @param {RegExp|String|Array} regex Regex or array of regex, or string to perform the test
	 *  @param {Number} [versionIndex=1]
	 *  @param {Function} [versionMatcher=false]
	 *
	 *  @example var browser = Eclair.Browser;
	 *  // The Android check is added like in Eclair :
	 *  browser.register('android', /Android (\d+)\.(\d+)(?:[.\-]([a-z0-9]+))?/);
	 */
	Browser.register = function (name) {

		var navigator;

		navigator = Browser.createNavigator.apply(this, arguments);
		Browser[name] = navigator;

		_.extend(Browser, navigator);

	}

	/**
	 *  <p> Factory method to create an instance of the class used internally by 
	 *  Eclair.Browser to test the browser. </p>
	 *
	 *  @memberof Eclair.Browser
	 *  @param {String} name This identifier will be used to create the test and registed at Eclair.Browser[name]
	 *  @param {RegExp|String|Array} regex Regex or array of regex, or string to perform the test
	 *  @param {Number} [versionIndex=1]
	 *  @param {Function} [versionMatcher=false]
	 *
	 */
	Browser.createNavigator = function (name, regex, versionIndex, versionMatcher) {

		versionMatcher = versionMatcher || false;
		versionIndex = _.isUndefined(versionIndex) ? 1 : versionIndex;

		var uaMatch = Browser.match(regex),
			navigator = {
				name: name
			};

		if (!uaMatch) {
			return false;
		}

		if (versionMatcher) {

			navigator.version = versionMatcher(userAgent, uaMatch);
			navigator.fullVersion = false;
			navigator.fullName = false;

		} else {

			navigator.version = uaMatch[versionIndex];
			navigator.fullVersion = getFullVersion(uaMatch);
			navigator.fullName = uaMatch[0];


		}

		return new Navigator(navigator);

	}

	var getFullVersion = function (uaMatch) {

		return _(uaMatch.slice(1)).without(void 0).join('.')

	}

	var lockScrollListener = function (e) {
		e.preventDefault();
	}

	/**
	 *  <p> Scroll utility to prevent the user to be able to scroll
	 *  the content view. </p>
	 *  <p> Destined to be used only on iOS3+ & Android 2.2+ </p>
	 *
	 *  @class
	 *  @memberof Eclair
	 */
	Browser.Scroll = {

		/**
		 *  Is the scroll on the browser view locked ?
		 *
		 *  @type {Boolean}
		 */
		locked: false,

		/**
		 *  Prevent scroll on the page
		 *
		 *  @method
		 */
		lock: function () {

			if (!this.locked) {
				w.addEventListener('touchmove', lockScrollListener, false);
				this.locked = true;
			}

		},

		/**
		 *  If the scroll has been previously prevented via Browser.scroll.lock,
		 *  this method allow us to unlock the scroll.
		 *
		 *  @method
		 */
		unlock: function () {

			if (this.locked) {
				w.removeEventListener('touchmove', lockScrollListener);
				this.locked = false;
			}

		},

		/**
		 *  Toggle the scroll availability
		 *
		 *  @method
		 *  @memberof Eclair.Browser.scroll
		 */
		toggle: function () {
			
			if (this.locked) {
				
				this.unlock();
				
			} else {
				
				this.lock();
				
			}

		}
	};

	/**
	 *  Return the baseUrl
	 *
	 *  @returns String
	 */
	Browser.getBaseUrl = function () {

		var anchor = document.createElement('a'),
			find = '@F@';

		anchor.href = find;

		return anchor.href.split(find)[0];


	}

	var envs = {
		webkit: {
			regex: /AppleWebKit\/([0-9]+)/
		},
		ios: {
			regex: /OS (\d+)_(\d+)(?:_(\d+))?.*AppleWebKit/,
			fullVersion: true
		},
		android: {
			regex: /Android (\d+)\.(\d+)(?:[.\-]([a-z0-9]+))?/,
			fullVersion: true
		},
		msie: {
			regex: /MSIE (\d+)\.(\d+).*IEMobile/
		},
		blackberry: {
			regex: /Blackberry.*Version\/(\d+)\.(\d+)(?:\.(\d+))?/ // Not working
		},
		firefox: {
			regex: /rv:(\d+)\.(\d+).*Firefox/
		},
		chrome: {
			regex: [
				/Chrome\/(\d+)\.(\d+)/,
				/Chromium\/(\d+)\.(\d+)/
			]
		}
	};

	// Build browsers object into Eclair.Browser
	var env = null;
	for (var browser in envs) {
	
		env = envs[browser];
		Browser.register(browser, env.regex, env.versionIndex, env.versionMatcher);
	
	}

})(Eclair, _);