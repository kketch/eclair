/**
 * LocalStorage Spec
 */
 
describe('Eclair.LocalStorage Spec', function () {
    
    var ls = Eclair.LocalStorage,
        settings = Eclair.settings
        
    afterEach(function () {
        
        localStorage.clear()
        
    })
    
    it('(add) should add an object to the localStorage', function () {
        
        var testObject = {
            tester: 'jasmine',
            env: 'phantomjs'
        }
        
        ls.add('test', testObject)
        
        expect(window.localStorage['Eclair-test']).toEqual(JSON.stringify(testObject))
        
    })
    
    it('(get) should retrieve an object previously stored in the localStorage', function () {
        
        var testObject = {
            companyName: 'Sofialys',
            location: 'Europe/Paris'
        }
        
        ls.add('test', testObject)
        
        expect(ls.get('test')).toEqual(testObject)
        
    })
    
    it('(remove) should remove an object previously stored in the localStorage', function () {
        
        var testObject = {
            companyName: 'Sofialys',
            location: 'Europe/Paris'
        }
        
        ls.add('test', testObject)
        
        ls.remove('test')
        
        expect(window.localStorage['Eclair-test']).toBeUndefined()
        
    })
    
    describe('Eclair.LocalStorage.LocalStoreObject Spec', function () {
        
        it('should create a new instance of LocalStoreObject', function () {
            
            var sampleData = {
                    firstname: 'Ben',
                    lastname: 'River'
                },
                lso = new ls.LocalStoreObject(sampleData)
                
            expect(lso.data).toEqual(sampleData)
            
        })
        
        it('(isValidStoreObject) should return true or false whether the lso object is expired or not', function () {
            
            var lso = new ls.LocalStoreObject
            
            lso.expire = +new Date
            
            waitsFor(function () {
                                
                return !ls.isValidStoreObject(lso)
                
            }, 'should be expired', 1)
            
        })
        
    })
    
    describe('Eclair.LocalStorage.Slot Spec', function () {
        
        it('should create a new instance of Slot and successfuly store the data to the localStorage', function () {
            
            var sampleData = {
                    firstname: 'Ben',
                    lastname: 'River'
                },
                slotAttributes = [
                    'data',
                    'name',
                    'stored',
                    'expire'
                ],
                slotMethods = [
                    'store',
                    'restore',
                    'remove'
                ],
                slot = new ls.Slot('test', sampleData)
                
            slotAttributes.forEach(function (attr) {
                
                expect(slot.hasOwnProperty(attr)).toBe(true)
                
            })
            
            slotMethods.forEach(function (method) {
                
                expect(typeof slot[method]).toBe('function')
                
            })
            
            var storeObject = window.localStorage[ settings.cachePrefix + settings.slotPrefix + 'test' ],
                dataObject = JSON.parse(storeObject).data
            
            expect(dataObject).toEqual(sampleData)
            
        })
        
        it('(store) should store an object', function () {
            
            var slot = new ls.Slot('test'),
                data = {
                    name: 'Ben'
                }
                
            slot.data = data
            expect(slot.stored).toBe(false)
            expect(window.localStorage[ settings.cachePrefix + settings.slotPrefix + 'test' ]).toBeUndefined()
            
            slot.store()
            
            var storeObject = window.localStorage[ settings.cachePrefix + settings.slotPrefix + 'test' ],
                dataObject = JSON.parse(storeObject).data
            
            expect(dataObject).toEqual(data)
            expect(slot.stored).toBe(true)
            
        })
        
        it('(restore) should restore a previous stored object from the localStorage', function () {
            
            var data = {
                    name: 'Ben'
                },
                slot = new ls.Slot('test', data)
                
            slot = undefined
            expect(slot).toBeUndefined()
            
            var slot = new ls.Slot('test')
            slot.restore()
            
            expect(slot.data).toEqual(data)
            expect(slot.stored).toBe(true)
            
        })
        
        it('(remove) should remove a previously stored object from the localStorage', function () {
            
            var data = {
                    name: 'Ben'
                },
                slot = new ls.Slot('test', data)
                
            expect(window.localStorage[ settings.cachePrefix + settings.slotPrefix + 'test' ]).toBeDefined()
            
            slot.remove('test')
            
            expect(window.localStorage[ settings.cachePrefix + settings.slotPrefix + 'test' ]).toBeUndefined()
        })
        
    })
    
})