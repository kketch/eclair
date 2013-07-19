/**
 * EventEmitter Spec
 */
 
 describe('Eclair.EventEmitter Spec', function () {

    var emitterInstance = new Eclair.EventEmitter;
    
    afterEach(function () {
        
        emitterInstance.removeEvent('test')
        
    })
    
	it('should provide the EventEmitter api when a new instance is invoked', function () {
		 
		var apiMethods = [
		     'addEventListener',
		     'emit',
		     'getListeners',
		     'removeEvent',
		     'removeEventListener'
		     ]
             
        apiMethods.forEach(function (method) {
            expect(typeof emitterInstance[method]).toBe('function')
        })
		
	})
    
    it('(addEventListener) should register a new event listener', function () {
            
        var anEventListener = function () {
                
            return true;
                
        }
            
        emitterInstance.addEventListener('test', anEventListener);
            
        expect(emitterInstance._events['test'][0]).toBe(anEventListener);
            
    })
    
    
    it('(removeEventListener) should remove an event listener', function () {
        
        var anEventListener = function () {
            
            return true;
            
        }
        
        emitterInstance.addEventListener('test', anEventListener);
        emitterInstance.removeEventListener('test', anEventListener);
        
        expect(emitterInstance._events.test).toBe(undefined);

    })
    
    it('(removeEvent) should remove a specified event and its listeners', function () {
        
        _.times(10, function () {
            
            emitterInstance.addEventListener('test', function () {
                // some random fn attached
            })
            
        })
        
        expect(emitterInstance._events.test.length).toBe(10)
        
        emitterInstance.removeEvent('test')
        
        expect(emitterInstance._events.test).toBe(undefined)
        
    })
    
    it('(emit) should emit an event with its parameters', function () {
        
        var indicator = false
        
        var eventListener = function (first, second) {
            
            expect(first+second).toBe('firstsecond')
            
            indicator = true
            
        }
        
        emitterInstance.addEventListener('test', eventListener)
        
        waitsFor(function () {
            return indicator;
        }, "the event listener has not been triggered", 100)
        
        emitterInstance.emit('test', 'first', 'second')
        
    })
    
    it('should provide the emitter instance as this context', function () {
	    
	    emitterInstance.on('contextTest', function () {
		    
		    expect(this).toBe(emitterInstance);
		    
	    })
	    
	    emitterInstance.emit('contextTest');
	    
    })
	 
 })