/**
 *  Orientation Component
 *
 */

(function(Eclair, _) {

	var browser = Eclair.Browser,
		orientationEmitter = new Eclair.EventEmitter,

		w = Eclair.global,
		matchMedia = w.matchMedia,

		// Booleans
		hasOrientationProperty = w.orientation ? true : false,

		// Should the orientationchange event be simulated ?
		shimOrientation = browser.ios && browser.version < 5 || browser.android && browser.fullVersion < 2.2,
		shimOrientationDegree = 0;

	/**
	 *  <p> Device Orientation Component </p>
	 *  <p> Unified interface to notify javascript scrips when the device orientation change </p>
	 *  <p> This component also shim window.matchMedia. </p>
	 *
	 *  @class
	 *  @memberof Eclair
	 *
	 *  @fires Eclair.Orientation#change
	 *  @fires Eclair.Orientation#portrait
	 *  @fires Eclair.Orientation#landscape
	 *
	 */
	var Orientation = Eclair.Module('Orientation', {
		initializer: orientationEmitter
	});


	/**
	 *  <p> Timestamp in ms of the last orientation change </p>
	 *  <p> Set to false if the orientation never changed. </p>
	 *
	 *  @memberof Eclair.Orientation
	 *  @type {String}
	 */
	Orientation.lastChange = null;

	/**
	 *  <p> This variable is set to true if the current orientation is
	 *  portrait </p>
	 *
	 *  @memberof Eclair.Orientation
	 *  @type {Boolean}
	 */
	Orientation.portrait = w.innerWidth <= w.innerHeight;

	/**
	 *  <p> This variable is set to false if the current orientation
	 *  is landscape </p>
	 *
	 *  @memberof Eclair.Orientation
	 *  @type {Boolean}
	 */
	Orientation.landscape = !Orientation.portrait;

	/**
	 *  <p> Current orientation of the device </p>
	 *  <p> Is set to 'portrait' or 'landscape' </p>
	 *
	 *  @memberof Eclair.Orientation
	 *  @type {String}
	 */
	Orientation.mode = Orientation.portrait ? 'portrait' : 'landscape';

	/**
	 *  Previously 2 matchMedia request was being made one for the old orientation
	 *  and one for the new orientation.
	 */
	var resizeListener = function () {

		var previousOrientation = Orientation.mode,
			other = Orientation.portrait ? 'landscape' : 'portrait';

		if ( !matchMedia('(orientation:' + previousOrientation + ')').matches ) {

			var e = Eclair.Event ? new Eclair.Event : {};

			Orientation.lastChange = +new Date;
			Orientation.mode = other;
			Orientation.portrait = !Orientation.portrait;
			Orientation.landscape = !Orientation.landscape;

			e.mode = other;

			Orientation.emit('change', e);
			Orientation.emit(other, e);

		}

		// Shim orientationchange for old platforms
		if (shimOrientation) {
			setTimeout(orientationFix, 1000/60);
		}

	}

	// Events documentation

	/**
	 *  Orientation change event
	 *
	 *  @event Eclair.Orientation#change
	 *  @type {Object}
	 */

	/**
	 *  Orientation portrait event
	 *
	 *  @event Eclair.Orientation#portrait
	 *  @type {Object}
	 */

	/**
	 *  Orientation landscape event
	 *
	 *  @event Eclair.Orientation#landscape
	 *  @type {Object}
	 */

	// Shim orientationchange event
	var orientationFix = function () {

		var screen = mraid ? mraid.getScreenSize()
					: {
						width: w.innerWidth,
						height:w.innerHeight
					},
			newOrientation = screen.width > screen.height ? 90 : 0,
			event = null;

		if (shimOrientationDegree != newOrientation) {

			shimOrientationDegree = newOrientation;

			event = document.createEvent('Event');
			event.initEvent('orientationchange', true, false);
			w.dispatchEvent(event);

		}

	}

	if (shimOrientation) {

		//use the polyfill only with if Eclair is used as Ad loader
		/*
		w.__defineGetter__('orientation', function () {

			return shimOrientationDegree;

		});
		*/

		// Set shimOrientation to false until
		// the loading event is fired
		// to prevent the shim to enter in conflict,
		// with the shim the SDK should provide
		shimOrientation = false;

		Eclair.on('loading', function () {

			// Now restore shimOrientation boolean to true
			// to enable the resizeListener to call
			// the orientationFix method
			shimOrientation = true;

			// Redefine the getter
			w.__defineGetter__('orientation', function () {

				return shimOrientationDegree;

			});

			// Apply the orientation fix
			setTimeout(orientationFix, 1000/60);

		});

	}

	// Listen for resizes
	w.addEventListener('resize', resizeListener, false);

	// The loading event means that the document has been replaced
	Eclair.on('loading', function () {

		// The resize listener has to be reattached if the document is replaced
		w.removeEventListener('resize', resizeListener, false);
		w.addEventListener('resize', resizeListener, false);

		matchMedia = w.matchMedia;

	});
	
})(Eclair, _);