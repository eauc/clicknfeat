'use strict';

describe('load settings', function() {
  describe('settings service', function() {
    beforeEach(inject([ 'settings', function(settingsService) {
      this.settingsService = settingsService;
    }]));

    describe('init()', function() {
      beforeEach(function() {
        this.stored_settings = {
          Bindings: {
            test1: { binding1: 'a',
                     binding3: 'd' },
            test3: { binding2: 'c' },
          }
        };
        
        this.localStorage.getItem
          .and.returnValue('localStorage.getItem.returnValue');

        this.default_settings = {
          Bindings: {
            test1: { binding1: 'a1',
                     binding2: 'a2' },
            test2: { binding1: 'b1' },
          }
        };
        this.test1_updater = jasmine.createSpy('test1_updater');
        this.settingsService.register('Bindings', 'test1',
                                      this.default_settings.Bindings.test1,
                                      this.test1_updater);
        this.test2_updater = jasmine.createSpy('test2_updater');
        this.settingsService.register('Bindings', 'test2',
                                      this.default_settings.Bindings.test2,
                                      this.test2_updater);

        this.settingsService.init()
          .then(R.bind(function(settings) {
            this.settings = settings;
          }, this));
        this.jsonParserService.parse.resolve(this.stored_settings);
      });
      
      it('should load settings from local storage', function() {
        expect(this.localStorage.getItem)
          .toHaveBeenCalledWith('clickApp.settings');
        expect(this.jsonParserService.parse)
          .toHaveBeenCalledWith('localStorage.getItem.returnValue');
      });
      
      it('should update modified settings', function() {
        expect(this.test1_updater)
          .toHaveBeenCalledWith({ binding1: 'a',
                                  binding3: 'd' });
        expect(this.test2_updater)
          .toHaveBeenCalledWith({});
      });
      
      it('should return settings object', function() {
        expect(this.settings.default)
          .toEqual(this.default_settings);

        expect(this.settings.current)
          .toEqual({
            Bindings: {
              test1: { binding1: 'a',
                       binding3: 'd' },
              test2: {  }
            }
          });
        expect(Object.getPrototypeOf(this.settings.current.Bindings.test1))
          .toEqual(this.default_settings.Bindings.test1);
        expect(Object.getPrototypeOf(this.settings.current.Bindings.test2))
          .toEqual(this.default_settings.Bindings.test2);
      });
    });
  });
});
