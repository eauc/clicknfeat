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
        this.localStorage.getItem.and.callFake(R.bind(function() {
          return JSON.stringify(this.stored_settings);
        }, this));

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
      });
      
      it('should load settings from local storage', function() {
        this.settingsService.init();

        expect(this.localStorage.getItem)
          .toHaveBeenCalledWith('clickApp.settings');
      });
      
      it('should update modified settings', function() {
        this.settingsService.init();

        expect(this.test1_updater)
          .toHaveBeenCalledWith({ binding1: 'a',
                                  binding3: 'd' });
        expect(this.test2_updater)
          .toHaveBeenCalledWith({});
      });
      
      it('should return settings object', function() {
        var settings = this.settingsService.init();
        expect(settings.default)
          .toEqual(this.default_settings);

        expect(settings.current)
          .toEqual({
            Bindings: {
              test1: { binding1: 'a',
                       binding3: 'd' },
              test2: {  }
            }
          });
        expect(Object.getPrototypeOf(settings.current.Bindings.test1))
          .toEqual(this.default_settings.Bindings.test1);
        expect(Object.getPrototypeOf(settings.current.Bindings.test2))
          .toEqual(this.default_settings.Bindings.test2);
      });
    });
  });
});
