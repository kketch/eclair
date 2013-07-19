/**
 * Eclair.Module Spec
 */
 
describe('Eclair.Module Spec', function () {
    
    Eclair.settings.xhrProxy = ''
    Eclair.settings.modulePath = 'spec/helpers/'
    
    it('should create a module and submodule with the correct references', function () {
        
        var myModule = Eclair.Module('MyModule')
        
        //expect(Eclair.MyModule).toBeDefined() trigger a TypeError on old Safari version
        expect(Eclair.MyModule === myModule).toBe(true)
        expect(Eclair.MyModule._Eclair === Eclair).toBe(true)
        expect(Eclair.MyModule._super === Eclair).toBe(true)
        expect(Eclair.MyModule.Module === Eclair.Module).toBe(true)
        
        var mySubModule = myModule.Module('MySubModule')
        
        expect(Eclair.MyModule.MySubModule === mySubModule).toBe(true)
        expect(Eclair.MyModule.MySubModule._Eclair === Eclair).toBe(true)
        expect(Eclair.MyModule.MySubModule._super === myModule).toBe(true)
        expect(Eclair.MyModule.MySubModule.Module === Eclair.Module).toBe(true)
        
        
    })
    
    it('should create a module which can inherit another object properties into its prototype', function () {
        
        var banana = Eclair.Module('Banana', {
                inherit: Eclair.EventEmitter
            })
            
        expect((new banana).emit).toBeDefined()
        
    })
    
    it('should succeed to load dependencies requested by a Module and trigger onload', function () {
        
        var indicator = false,
            apple = Eclair.Module('Apple', {
                dependencies:'UselessModule',
                onload: function () {
                    console.log('Onload has been triggered')
                    indicator = true
                }
            })
            
        waitsFor(function () {
            
            return indicator
            
        }, 'wait for the onload method', 4000)
        
        runs(function () {
            expect(Eclair.UselessModule).toBeDefined()
        })
        
    })
})