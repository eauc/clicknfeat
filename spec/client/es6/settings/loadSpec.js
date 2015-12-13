'use strict';

describe('load settings', function() {
  describe('settings service', function() {
    beforeEach(inject([ 'settings', function(settingsService) {
      this.settingsService = settingsService;
    }]));

    when('init()', function() {
      this.ret = this.settingsService.init();
    }, function() {
      beforeEach(function() {
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

        this.localStorageService.save.resolveWith = R.identity;
      });
      
      it('should load settings from local storage', function() {
        expect(this.localStorageService.load)
          .toHaveBeenCalledWith('clickApp.settings');
      });

      when('load fails', function() {
        this.localStorageService.load.rejectWith = 'reason';
      }, function() {
        it('should return default object', function() {
          this.thenExpect(this.ret, function(settings) {
            expect(settings.default)
              .toEqual(this.default_settings);

            expect(settings.current)
              .toEqual({
                Bindings: {
                  test1: {  },
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

      when('load succeeds', function() {
        this.localStorageService.load.resolveWith = {
          Bindings: {
            test1: { binding1: 'a',
                     binding3: 'd' },
            test3: { binding2: 'c' },
          }
        };
      }, function() {
        it('should update modified settings', function() {
          this.thenExpect(this.ret, function() {
            expect(this.test1_updater)
              .toHaveBeenCalledWith({ binding1: 'a',
                                      binding3: 'd' });
            expect(this.test2_updater)
              .toHaveBeenCalledWith({});
          });
        });
      
        it('should return settings object', function() {
          this.thenExpect(this.ret, function(settings) {
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
  });
});
