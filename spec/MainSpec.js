/**
 * MainSpec.js
 */
 
 describe("Eclair.js Main Functionnality", function () {
 	 
	 var global = (function() { return this })();
	 
	 // Eclair.global
	 it('should return a global object reference (window)', function() {
		 expect(Eclair.global).toBe(global)
	 })
	 
	 // Eclair.document
	 it('should return a window.document reference', function() {
		 expect(Eclair.document).toBe(global.document)
	 })
	 
	 // Eclair.head
	 it('should return document.head reference', function() {
		 expect(Eclair.head).toBeDefined()
		 expect(Eclair.head).toEqual(jasmine.any(Object))
		 expect(Eclair.head.nodeName.toUpperCase()).toBe('HEAD')
	 })
		 
	 // Eclair settings
	 it('should return the Eclair settings object', function() {
		 
		 Eclair.settings.define({
			 mySetting1: true,
			 mySetting2: 0,
			 mySetting3: false,
			 mySetting4: ''
		 })
		 
		 var props = [
		 	'mySetting1',
		 	'mySetting2',
			'mySetting3',
			'mySetting4'
		 ]
		 
		 props.forEach(function(prop) {
			 expect(Eclair.settings[prop]).toBeDefined()
		 })
		 
		 expect(Eclair.settings instanceof Eclair.Config).toBe(true)
		 
	 })
	 
	describe('check if the mobile platform provide solid match media support', function () {
 		 
		var br = Eclair.Browser
		
		if (br.ios || br.android) {
			
			it('should provide the window.orientation property', function () {
				
				expect(global.orientation).toBeDefined()
				
			})
			
			var br = Eclair.Browser,
			
				width = global.innerWidth,
				height = global.innerHeight,
				greaterWidth = width + 20,
				lesserWidth = width - 20,
				portrait = global.orientation === 0 || global.orientation === 180
				
			// Check for landscape based Android tablet
			if (br.android && !br.match('Mobile')) {
				
				if (portrait && global.matchMedia('(orientation: landscape)').matches
					|| !portrait && global.matchMedia('(orientation: portrait)').matches
				) {
					portrait = !portrait
				}
				
			}
			
			var mode = portrait ? 'portrait' : 'landscape',
				other = portrait ? 'landscape' : 'portrait'
				
			console.log('Device has width: ' + width)
			console.log('Device has height: ' + height)
			console.log('Device is in ' + mode + ' mode')
		
			it('should return true for media query: (min-width:'+ width +'px)', function () {
				
				expect( global.matchMedia('(min-width:'+ width +'px)').matches ).toBe(true)
				
			})
			
			it('should return true for media query: (max-width:'+ width +'px)', function () {
				
				expect( global.matchMedia('(max-width:'+ width +'px)').matches ).toBe(true)
				
			})
			
			it('should return false for media query: (max-width:'+ lesserWidth +'px)', function () {
				
				expect( global.matchMedia('(max-width:'+ lesserWidth +'px)').matches ).toBe(false)
				
			})
			
			it('should return false for media query: (min-width:'+ greaterWidth +'px)', function () {
				
				expect( global.matchMedia('(min-width:'+ greaterWidth +'px)').matches ).toBe(false)
				
			}) 
			
			it('should return true for media query: (orientation: '+ mode +')', function () {
				
				expect( global.matchMedia('(orientation:'+ mode +')').matches ).toBe(true)
				
			})
			
			it('should return false for media query: (orientation: '+ other +')', function () {
				
				expect( global.matchMedia('(orientation:'+ other +')').matches ).toBe(false)
				
			})

		}
		
	})
	 
 })