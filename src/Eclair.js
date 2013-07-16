/**
 * Eclair.js
 *  main file
 */

(function (w, _) {

	var Eclair = {},
		doc = w.document;

	// Expose eclair to the global scope
	Eclair._Eclair = w.Eclair = Eclair;

	// Module array
	Eclair._modules = [];

	/**
	 *  eclair version number
	 *
	 *  @name eclair.VERSION
	 *  @type String
	 */
	Eclair.VERSION = "{{{version}}}";

	/**
	 *  Reference to the global object
	 *
	 *  @name eclair.global
	 *  @type Object
	 */
	Eclair.global = Eclair.window = w;

	/**
	 *  Reference to the HTML document
	 *
	 *  @name eclair.document
	 *  @type HTMLDocument;
	 */
	Eclair.document = doc;

	/**
	 *  Reference to the HTML document head section DOM element
	 *
	 *  @name eclair.head
	 *  @type HTMLHeadElement
	 */
	Eclair.head = doc.head || doc.getElementsByTagName('head')[0];

	/**
	 *  Check if a module is loaded
	 *
	 *  @method
	 *  @memberof eclair
	 *  @param {String} moduleName
	 *  @return {Boolean} True when the module is already loaded, false when it isn't
	 */
	Eclair.isLoaded = function (moduleName) {

		if (this._modules.indexOf(moduleName) !== -1)
			return true;

		return false;

	 }

	/**
	 *  <p> Jin Module constructor </p>
	 *  <p> A Jin Module can be a simple object operating
	 *  on a private scope like an anonymous function,
	 *  or a "class"</p>
	 *  <p> See eclair.require documentation for more information on caching and how to disable it </p>
	 *
	 *  @constructor
	 *  @memberof eclair
	 *
	 *  @param {String} namespace Module namespace
	 *  @param {Object} options Module parameters object
	 *	@param {Function} [options.initializer=function(){}] Constructor
	 *  @param {Function} [options.inherit=function(){}] Extend a super class
	 *  @param {Object|String} [options.dependencies] Dependencies needed by the module
	 *  @param {Function} [options.onload] Code to be executed when dependencies specified by the module has been fetched
	 *
	 *	@example var MyModule = Eclair.Module("MyModule", { // in MyModule.js
	 *		inherit: Eclair.EventEmitter,
	 *		dependencies: ['SomeModuleName','SomeOtherModuleName'],
	 *		onload: function () {
	 *			console.log("My module's dependencies are loaded")
	 *		}
	 *  })
	 *
	 *  MyModule.myStaticMethod = function () {
	 *  	
	 *  }
	 *
	 *	@example Eclair.require('MyModule', function () { // in index.html, global scope
	 *  	var MyModule = eclair.MyModule
	 *		MyModule.myStaticMethod()
	 *
	 *  	var myInstance = new MyModule;
	 *
	 *  	// we can then use Jin.EventEmitter methods on our module
	 *  	// like this one to add a listener
	 *  	myInstance.on("someEvent", function () {
	 *  		// do some action
	 *  	})
	 *
	 *  	// then we can emit an event to trigger the listener
	 *  	myInstance.emit("someEvent")
	 *  })
	 *
	 */
	Eclair.Module = function (namespace, options) {

		var module,
			initializer;

		if (this._Eclair.isLoaded(namespace)) {
			throw new Error('Module namespace already used.');
		}

		options = _.isUndefined(options) ? {} : options;
		initializer = options.initializer || function () {};
		module = options.bootstraper || initializer;

		if (module.prototype) {

			if (options.inherit) {
				module.prototype = new options.inherit;
				module.prototype.constructor = initializer;
			}

			module.prototype._initializer = initializer;	

		}

		// Load dependencies
		if (options.dependencies) {
			this._Eclair.load(options);
		}

		this[namespace] = module;

		module._Eclair = this._Eclair;
		module.Module = this.Module;
		module._super = this;

		this._Eclair._modules.push(namespace);

		return module;

	}

})(this, _);