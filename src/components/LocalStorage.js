/**
 *
 *  LocalStorage.js
 *
 */

(function (Eclair, _) {

	/**
	 *  LocalStorage Component settings
	 *
	 *  @name Eclair.settings
	 *  @property {String} [settings.cachePrefix] - Cache prefix to be used with localStorage (Eclair- by default)
	 *  @see Eclair.LocalStorage
	 *
	 */
	Eclair.settings.define({
		// localStorage prefix
		cachePrefix: 'Eclair-',
		// localStorage default expire
		cacheExpire: 5000,
		slotPrefix: 'slot-'
	});

	/**
	 *  <p> LocalStorage Component </p>
	 *  <p> Abstract the localStorage, this is used by Eclair to cache scripts </p>
	 *  <p> See LocalStorage.Slot for a quick and useful persistence tool </p>
	 *
	 *  @constructor
	 *  @memberof Eclair
	 */
	var LocalStorage = Eclair.Module("LocalStorage"),
		settings = Eclair.settings;

	/**
	 *  Return true if the localStorage is available 
	 *  and enabled, false otherwise
	 *
	 *  @type {Boolean}
	 *  @memberof Eclair.LocalStorage
	 */	 
	LocalStorage.enabled = (function () {

		var TEST = 'Eclair-localstorage';
		
		try {
		
			var localStorage = Eclair.global.localStorage;
			localStorage.setItem(TEST, TEST);
			localStorage.removeItem(TEST);
			return true;
		
		} catch (e) {
		
			return false;
		
		}

	})();

	 // Use the localStorage if available or a in memory simulated alternative
	var localStorage = LocalStorage.enabled ? Eclair.global.localStorage : {
	
		_data: {},
		
		setItem: function (key, value) {
		
			return this._data[key] = String(value);
		
		},
		
		getItem: function (key) {
		
			return this._data.hasOwnProperty(key) ? this._data[key] : undefined;
		
		},
		
		removeItem: function (key) {
		
			return delete this._data[key];
		
		},
		
		clear: function () {
		
			return this._data = {};
		
		}
	
	}

	/**
	 *  <p> LocalStoreObject constructor </p>
	 *  <p> A simple wrapper to set expirations to stored objects</p>
	 *  <p> The isValidStoreObject method can be used to test whether
	 *  an LocalStoreObject instance is still valid or is expired</p>
	 *
	 *  @constructor
	 *  @memberof Eclair
	 *  @param {Object} data
	 *  @param {Number} expire in hours
	 *
	 *  @see Eclair.LocalStorage
	 */
	LocalStorage.LocalStoreObject = function (data, expire) {

		var now = +new Date;

		expire = expire ? expire : settings.cacheExpire;

		/**
		 *  Data stored
		 *  @instance
		 *  @type {Object}
		 */
		this.data = data;

		/**
		 *  Creation date
		 *  @instance
		 *  @type {Number}
		 */
		this.stamp = now;

		/**
		 *  When do this store object expire
		 *  @instance
		 *  @type {Number}
		 */
		this.expire = now + expire * 60 * 60 * 1000;

	 }

	 /**
	  *  <p> Slot constructor </p>
	  *  <p> Slot is a useful localStorage abstraction within one class </p>
	  *  <p> Operate beyond a LocalStoreObject instance </p>
	  *
	  *  @constructor
	  *  @memberof Eclair
	  *  @param {String} name Name of the slot, this is also its <strong>identifier</strong>
	  *  @param {Object} [data={}] A data object to be stored
	  *  @param {Number} [expire=settings.cacheExpire] in seconds
	  *
	  *  @see Eclair.LocalStorage
	  *
	  *  @example var Slot = Eclair.LocalStorage.Slot // create a local reference to Slot
	  *
	  *  var mySlot = new Slot("mySlot")
	  *  // Then attach some data to this slot
	  *  mySlot.data.record = "Hello"
	  *  // And store it
	  *  mySlot.store()
	  *
	  *  // You can also directly create the slot and store the data :
	  *  var mySlot = new Slot("mySlot", {record: "Hello"});
	  */
	 LocalStorage.Slot = function (name, data, expire) {

		if (_.isUndefined(name) || !(this instanceof LocalStorage.Slot))
			return false;

		/**
		 *  Name of the slot
		 *  @instance
		 *  @type {String}
		 */
		this.name = name;
		
		/**
		 *  Data object attached to the slot
		 *  @instance
		 *  @type {Object}
		 */
		this.data = data || {};
		
		/**
		 *  Is the slot currently stored in the localStorage ?
		 *  @instance
		 *  @type {Boolean}
		 */
		this.stored = false;
		
		/**
		 *  When does the storage expire (in seconds)
		 *  @instance
		 *  @type {Number}
		 */
		this.expire = expire ? expire : settings.cacheExpire;
		
		/**
		 *  Store the object in its current state
		 *  
		 *  @method
		 *  @instance
		 */
		this.store = function () {
			
			this.storeObject = new LocalStorage.LocalStoreObject(this.data, this.expire);
			LocalStorage.add(settings.slotPrefix + this.name, this.storeObject);
	
			this.stored = true;
			
		}
		
		/**
		 *  Restore the data stored in localStorage
		 *  from the name of the Slot as identifier
		 *
		 *  @method
		 *  @instance
		 */
		this.restore = function () {
			
			var storeObject = LocalStorage.get(settings.slotPrefix + this.name);
			
			if (storeObject) {
				
				this.storeObject = storeObject;
				this.data = storeObject.data;
				this.expire = storeObject.expire;
				
				this.stored = true;
				
				return true;
			 
			} else {
				
			 return false;
			 
			}
		}
		
		/**
		 *  Remove the slot data if it is stored
		 *
		 *  @method
		 *  @instance
		 */
		this.remove = function () {
			
			if (this.stored) {
					
				var removed = LocalStorage.remove(settings.slotPrefix + this.name);
				
				if (removed)
				this.stored = false;
				
				return removed;
			
			} else {
				
				return false;
			
			}
			
		}
		
		if (data) {
			
			this.store();
		
		}

	 }

	 /**
	  *  Is this LocalStoreObject instance still valid
	  *
	  *  @method
	  *  @memberof Eclair.LocalStorage
	  *  @param {Object} lso Local Store Object instance
	  *
	  *  @see Eclair.LocalStorage.LocalStoreObject
	  */
	 LocalStorage.isValidStoreObject = function (lso) {

		return (lso.expire - +new Date() > 0);

	 }

	/**
	 *  Add to local storage method
	 *
	 *  @method
	 *  @memberof Eclair.LocalStorage
	 *  @param {String} key The key
	 *  @param {Object} object An object to store
	 */	
	LocalStorage.add = function (key, object) {

		try {

			localStorage.setItem(settings.cachePrefix + key, JSON.stringify(object));
			return true;

		} catch (e) {

			if ( e.name.toUpperCase().indexOf('QUOTA') >= 0 ) {
			
				var item,
					tempScripts = [];
			
				for (item in localStorage) {
					
					if (item.indexOf(settings.cachePrefix) === 0) {
						tempScripts.push(JSON.parse(localStorage[item]));
					}
					
				}
			
				if (tempScripts.length) {
			
					tempScripts.sort(function (a, b) {
						return a.stamp - b.stamp;
					});
			
					LocalStorage.remove(tempScripts[0].key);
			
					return LocalStorage.add(key, object);
			
				}
			
			}

		}

	}

	/**
	 *  Remove from local storage method
	 *
	 *  @method
	 *  @memberof Eclair.LocalStorage
	 *  @param {String} key
	 */	
	LocalStorage.remove = function (key) {

		localStorage.removeItem(settings.cachePrefix + key);
		return true;

	}

	/**
	 *  Retrieve data from the local storage
	 *
	 *  @method
	 *  @memberof Eclair.LocalStorage
	 *  @param {String} key
	 */
	LocalStorage.get = function (key) {

		var item = localStorage.getItem(settings.cachePrefix + key);

		try {
			return JSON.parse(item || 'false');
		} catch (e) {
			return false;
		}

	}

	// Clean localstorage on new version
	Eclair.on('init', function () {
	
		var storredVersion = LocalStorage.get('version');
		
		if (storredVersion) {
		
			if (storredVersion !== Eclair.VERSION && localStorage.clear) {
			
				localStorage.clear();
				LocalStorage.add('version', Eclair.VERSION);
			
			}
		
		} else {
		
			LocalStorage.add('version', Eclair.VERSION);
		
		}
	
	});

})(Eclair, _);