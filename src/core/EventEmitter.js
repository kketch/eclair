/**
 * Eclair.EventEmitter
 *
 */

(function(Eclair, _) {

	 /**
	  *  <p> EventEmitter Compenent Constructor, this a simple event emitter,
	  *  no parameters needed to create an instance from it. </p>
	  *  <p> This compenent enable easy non blocking event-driven programming with javascript </p>
	  *
	  *  @constructor
	  *  @memberof Eclair
	  *
	  *  @example // A new instance of EventEmitter
	  *  var emitter = new Eclair.EventEmitter;
	  */
	 var EventEmitter = Eclair.Module("EventEmitter"),
		 emitterProto = EventEmitter.prototype;

	 /**
	  *  Find the index of the listener
	  *
	  *  @param {Function} listener
	  *	 @param {Array} listeners
	  */
	 var findListener = function (listener, listeners) {

		 return _(listeners).indexOf(listener);

	 }

	 /**
	  *  Return the event object or create it if required
	  *
	  *  @method
	  *  @private
	  *  @memberof Eclair.EventEmitter
	  *  @name _getEvents
	  *  @instance
	  *  @return {Object} events
	  */
	 emitterProto._getEvents = function () {

		 return this._events || (this._events = {});

	 }

	 /**
	  *  Return a listener array for a specific event,
	  *  initialize the event object and listener arrays if required
	  *
	  *  @method
	  *  @memberof Eclair.EventEmitter
	  *  @name getListeners
	  *  @instance
	  *  @param {String} event Name of the event
	  *  @return {Array} All listeners of this event
	  */
	 emitterProto.getListeners = function (event) {

		 var events = this._getEvents();

		 return events[event] || (events[event] = []);

	 }

	 /**
	  *  Remove all listeners for a specified event
	  *
	  *  @method
	  *  @memberof Eclair.EventEmitter
	  *  @name removeEvent
	  *  @instance
	  *  @param {String} event Name of the event to be removed (listeners are removed too)
	  */
	 emitterProto.removeEvent = function (event) {

		 if (event) {
			 delete this._getEvents()[event];
		 } else {
			 delete this._events;
		 }

		 return this;

	 }

	 /**
	  *  <p> Add an event listener to the EventEmitter instance. </p>
	  *  <p> <strong>"addEventListener" can be used as alias.</strong> </p>
	  *
	  *  @method
	  *  @memberof Eclair.EventEmitter
	  *  @name addEventListener
	  *  @instance
	  *  @param {String} event Name of the event to listen for
	  *  @param {Function} listener
	  *
	  *  @example emitter.on("message", function (message) {
	  *  	console.log("New message: ", message)
	  *  ));
	  */
	 emitterProto.on = function (event, listener) {

		 // Do not attach anything else that a function:
		 if (typeof listener !== 'function') {
			 return;
		 }

		 var listeners = this.getListeners(event);

		 if (findListener(listener, listeners) === -1) {
			 listeners.push(listener);
		 }

		 // To allow chaining return an instance of Eclair.EventEmitter
		 return this;

	 }

	 /**
	  *  <p> Remove an event listener. </p>
	  *  <p> <strong>"removeEventListener" can be used as alias </strong></p>
	  *
	  *  @method
	  *  @memberof Eclair.EventEmitter
	  *  @name removeEventListener
	  *  @instance
	  *  @param {String} event Name of the event
	  *  @param {Function} listener Listener method reference to be removed
	  *
	  *  @example emitter.off("someEvent", myListener);
	  */
	 emitterProto.off = function (event, listener) {

		 var listeners = this.getListeners(event),
			 index = findListener(listener, listeners);

		 if (index !== -1) {
			 listeners.splice(index, 1);

			 // If the listener array is empty, we can remove the event
			 if (listeners.length === 0) {
				 this.removeEvent(event);
			 }
		 }

		 return this;

	 }

	 /**
	  *  <p> Trigger an event. </p>
	  *
	  *  @method
	  *  @memberof Eclair.EventEmitter
	  *  @name emit
	  *  @instance
	  *  @param {String} event Name of the event to be triggered
	  *  @param {...String} args Arguments to be passed to the listener
	  *
	  *  @example emitter.emit("message", "Hello there");
	  *  @example // Or with multiple arguments
	  *  emitter.emit("event", arg1, arg2, arg3, arg4);
	  *  
	  */
	 emitterProto.emit = function (event, arg1, arg2, bound) {

		 var listeners = this.getListeners(event),
			 args = bound ? _.toArray(arguments).slice(1) : false,
			 i = listeners.length,
			 response;

		 while (i--) {

			 response = args ? listeners[i].apply(this, args) : listeners[i].call(this, arg1, arg2);

			 // if the listener return true, then we should remove it
			 if (response === true) {
				 this.off(event, listeners[i]);
			 }

		 }

		 return this;

	 }

	 /**
	  *  <p> Trigger an event in a specific context. </p>
	  *
	  *  @method
	  *  @memberof Eclair.EventEmitter
	  *  @name emit
	  *  @instance
	  *  @param {String} event Name of the event to be triggered
	  *  @param {...String} args Arguments to be passed to the listener
	  *
	  *  
	  */
	 emitterProto.emitAs = function (context, event, arg1, arg2, bound) {

	 	var listeners = this.getListeners(event),
			args = bound ? _.toArray(arguments).slice(2) : false,
			i = listeners.length,
			response;

		while (i--) {

			response = args ? listeners[i].apply(context, args) : listeners[i].call(context, arg1, arg2);

			// if the listener return true, then we should remove it
			if (response === true) {
				this.off(event, listeners[i]);
			}

		}

		return this;

	 }

	 /**
	  *  Trigger an event with parameters passed as an array
	  *
	  *  @method
	  *  @memberof Eclair.EventEmitter
	  *  @instance
	  *  @param {String} event Name of the event to be triggered
	  *  @param {Array} args Arguments array to pass to the listeners
	  *  @example // Emit an array of arguments, which the listeners will receive as seperate arguments
	  *  emitter.emitArray("someOtherEvent", [arg1, arg2, arg3, arg4]);
	  */
	 emitterProto.emitArray = function (event, args) {

			args.unshift(event)
			this.emit.apply(this, args)

			return this;

	 }

	// Add aliases
	_.extend(emitterProto, {

		addEventListener: emitterProto.on,
		removeEventListener: emitterProto.off

	});

	// Add an EventEmitter instance to Eclair
	_.extend(Eclair, new EventEmitter);

})(Eclair, _);