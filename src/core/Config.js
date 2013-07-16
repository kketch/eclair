/**
 *  Eclair.Config
 *
 */

(function(Eclair, _) {

	/**
	 * <p> Config Core Class </p>
	 * <p> Dictionnary-like class to store settings, change them,
	 * restore the defaults etc. </p>
	 * <p>This is the API of the Eclair.settings object</p>
	 *
	 * @constructor
	 * @memberof Eclair
	 *
	 */
	 var Config = Eclair.Module('Config', {
		 initializer: function (object) {

			 var defaults = {},
				 frozen = false;

			 /**
			  *  Meant to be used to froze the configuration,
			  *  it means that previously stored values are now
			  *  default values and can be retrieved via the defaults method
			  *
			  *  @memberof Eclair.Config
			  *  @name freeze
			  *  @method
			  *  @instance
			  */    
			 this.freeze = function () {
				 frozen = true;
			 }

			 /**
			  *  Retrieve a default value
			  *
			  *  @memberof Eclair.Config
			  *  @name defaults
			  *  @method
			  *  @instance
			  *
			  *  @param {String} set Key of the default value to retrieve
			  */
			 this.defaults = function (set) {

				 return defaults[set];

			 }

			 /**
			  *  <p> Used to set some settings, a key value object can be used,
			  *  or two strings as arguments if we need to define only one setting </p>
			  *
			  *  @memberof Eclair.Config
			  *  @name define
			  *  @method
			  *  @instance
			  *
			  *  @param {Object|String} set Object or key
			  *  @param {*} [value] value to set when the method is used inline
			  *
			  *  @example var conf = new Jin.Config;
			  *  conf.define({
			  *     key: 'value'
			  *  );
			  *
			  *  // Or inline style
			  *  conf.define('key', 'value');
			  */
			 this.define = function (arg1, arg2) {

				 if (frozen || arguments.length > 2 || !arguments.length ) {

					 return;

				 } else if (arguments.length === 2) {

					 defaults[arg1] = arg2;
					 this[arg1] = arg2;

				 } else {

					 _.extend(defaults, arg1);
					 _.extend(this, arg1);

				 }

			 }

			 if (!_.isUndefined(object)) {
				 this.define(object);
			 }

		 }
	 });

	 // Define Eclair settings object
	 Eclair.settings = new Eclair.Config;


})(Eclair, _);