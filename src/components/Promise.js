/**
 * Promise core component
 *
 */
(function (Eclair, _) {

	/**
	 *  <p> Promise </p>
	 *  <p> Simple utility for asynchronous operations on top of Eclair.EventEmitter </p>
	 *
	 *  @constructor
	 *  @memberof Eclair
	 *  @augments Eclair.EventEmitter
	 *
	 */
	var Promise = Eclair.Module('Promise', {

			inherit: Eclair.EventEmitter,
			initializer: function () {
				this.pending = true;
			}

		}),
		promiseProto = Promise.prototype;

	/**
	 *  Resolve the promise
	 *
	 *  @method
	 *  @memberof Eclair.Promise
	 *  @name done
	 *  @instance
	 *  @param {Object|Boolean} error
	 *  @param {*} result
	 */	
	promiseProto.done = function (error, result) {

		if (this.pending) {

			this.pending = false;
			this.error = error;
			this.result = result;

			this.emit('done', error, result);

			if (error) {
			   	this.emit('error', error);
			} else {
			   	this.emit('success', result);
			} 

		}

		return this;

	}

   /**
	*  Add a callback to the promise
	*
	*  @method
	*  @memberof Eclair.Promise
	*  @name then
	*  @instance
	*  @param {Function} callback
	*/	
	promiseProto.then = function (callback) {

		if (this.pending) {

		   this.on('done', callback);

		} else {

			callback.call(this, this.error, this.result);

		}

		return this;

	}

	promiseProto.dismiss = function (callback) {

		this.off('done', callback);
		return this;

	}

})(Eclair, _);