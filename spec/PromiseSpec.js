/**
 *
 *  PromiseSpec.js
 *
 */
 
describe('Eclair.Promise Spec', function () {
	
	it('should create a new promise instance', function () {
		
		var promise = new Eclair.Promise,
		
			methods = [
			
				'on',
				'off',
				'emit',
				'then',
				'done'
			
			]
			
		expect(promise instanceof Eclair.Promise).toBe(true)
			
		methods.forEach(function (method) {
			
			expect(typeof promise[method]).toBe('function')
			
		})
		
	})
	
	it('should be resolvable and callbacks should be fired', function () {
		
		var promise = new Eclair.Promise,
			counter = 0
		
		promise.then(function () {
			
			counter++
			
		})
		
		promise.then(function () {
			
			counter++
			
		})
		
		promise.done(null, null)
		
		expect(counter).toBe(2)
		
	})
	
	it('should pass errors and result', function () {
		
		var promise = new Eclair.Promise
		
		promise.then(function (err, result) {
			
			expect(err).toBeDefined()
			expect(result).toBeDefined()
			
		})
		
		promise.done(true, "")
		
	})
	
	it('should fire success, done and error event', function () {
		
		var promise = new Eclair.Promise,
			promise2 = new Eclair.Promise,
			successFired = false,
			errorFired = false,
			doneFired = false
		
		promise.on('success', function () {
			
			successFired = true
			
		})
		
		// without error
		promise.done(null, '')
		
		promise2.on('error', function () {
			
			errorFired = true
			
		})
		
		promise2.on('done', function () {
			
			doneFired = true
			
		})
		
		// with error
		promise2.done(true, '')
		
		expect(successFired).toBe(true)
		expect(errorFired).toBe(true)
		expect(doneFired).toBe(true)
		
	})
	
	it('should dismiss a callback', function () {
		
		var promise = new Eclair.Promise;
			callback = function () {
				
			}
			
		promise.then(callback)
		
		// callback should have been added
		expect(promise._events['done'].length).toBe(1)
		
		// dismiss the callback
		promise.dismiss(callback)
		
		// the callback should be removed
		expect(!!promise._events['done']).toBe(false)
		
	})
	
})