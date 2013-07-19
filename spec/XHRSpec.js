/**
 * XHR Spec
 */
 
describe('Eclair.XHR Spec', function () {
    
    var XHR = Eclair.XHR,
        settings = Eclair.settings,
        members = [
         // Eclair.EventEmitter
         'on',
         'off',
         'emit',
         // Eclair.Promise
         'then',
         'done',
         'dismiss',
         // Eclair.XHR
         'method',
         'url',
         'data',
         'headers',
         'headersOnly',
         'send',
         'abort',
         'xhr'
        ]
        
    it('should create an instance of Eclair.XHR', function () {
        
       var xhr = new Eclair.XHR;
       
       members.forEach(function (member) {
          
           expect(xhr[member]).toBeDefined();
           
       })
       
       expect(xhr instanceof XHR).toBe(true);
        
    })
    
    it('(encodeURI) should encode a URI', function () {
        
        var params = {
                image: 'someimage.png',
                due: 'yesterday',
                force: true
            },
            paramString = "&image=someimage.png&due=yesterday&force=true"
            
        expect(XHR.encodeURI(params)).toBe(paramString)
        
    })
    
    it('(createRequest) should create an instance of Eclair.XHR', function () {
        
        // /!\ This spec produce a request to hostname/null
        var xhr = XHR.createRequest()
        
        members.forEach(function (member) {
            
            expect(xhr[member]).toBeDefined()
            
        })
        
    })
    
    it('(xhr) should lazy return a XMLHttpRequest', function () {
        
        var xhr = new Eclair.XHR;
        
        expect(xhr._xhr).toBeUndefined()
        
        var dontMatter = xhr.xhr()
        
        expect(xhr._xhr).toBeDefined()
        
    })
    
    it('should be able to perform a simple synchronous request', function () {
        
        var xhr = new XHR({
            
            url: 'spec/helpers/UselessModule.js',
            async: false
            
        })
        
        window.xhr = xhr;
        
        xhr.send();
        
        expect(xhr.responseText).toBeDefined();
        expect(xhr.responseText.length > 0).toBe(true);
        
    })
        
    it('should be able to perform a simple asynchronous request', function () {
        
        var indicator = false
        
        var xhr = new XHR({
            
            method:'GET',
            url: 'spec/helpers/UselessModule.js'
            
        })
        
        xhr.on('success', function (responseText) {
            
            indicator = true
            expect(typeof responseText).toBe('string')
            expect(responseText).toBeDefined()
            
        })
        
        xhr.send()
        
        waitsFor(function () {
            
            return indicator
            
        }, 'wait for the onload', 4000)
        
        runs(function () {
            expect(indicator).toBe(true)
        })
        
        
    })
    
    it('should perform a headersOnly get request', function () {
        
        var indicator = false
        
        var xhr = new XHR({
            
            url: 'spec/helpers/UselessModule.js',
            headersOnly: true
            
        })
        
        expect(xhr.headersOnly).toBe(true)
        
        xhr.on('success', function (responseText) {
            
            indicator = true
            expect(typeof responseText).toBe('string')
            expect(responseText).toBeDefined()
            
        })
        
        xhr.send()
        
        waitsFor(function () {
            
            return indicator
            
        }, 'wait for the request to complete', 4000)
        
        runs(function () {
            
            expect(xhr.responseText).toBeDefined()
            
        })
        
    })
    
    it('(get) should perform a GET request', function () {
        
        var indicator = false
        
        XHR.get('spec/helpers/UselessModule.js', function (err, responseText) {
            
            expect(err).toBe(null)
            
            expect(typeof responseText).toBe('string')
            expect(responseText.length).toBeGreaterThan(0)
            
            indicator = true
            
        })
        
        waitsFor(function () {
            
            return indicator
            
        }, 'wait for the load', 4000)
        
    })
    
    it('should trigger error events', function () {
        
        var indicator = false
        
        XHR.get('nonexistenturl', function (err) {
            
            expect(err).not.toBe(null)
            
            indicator = true
            
        })
        
        waitsFor(function () {
            
            return indicator
            
        }, 'wait for the error', 200)
        
    })
    
    it('should perform a request using Eclair.ajax jquery like factory method', function () {
        
        var indicator = false
        
        Eclair.ajax({
            url: 'spec/helpers/UselessModule.js',
            success: function (responseText) {
                
                indicator = true
                expect(typeof responseText).toBe('string')
                expect(responseText).toBeDefined()
                
            }
        })
        
        waitsFor(function () {
            
            return indicator
            
        }, 'wait for the load', 4000)
        
    })
})