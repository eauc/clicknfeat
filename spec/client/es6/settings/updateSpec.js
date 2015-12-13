'use strict';

describe('reset settings', function() {
  describe('settings service', function() {
    beforeEach(inject([ 'settings', function(settingsService) {
      this.settingsService = settingsService;

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
    }]));

    when('bind(<data>)', function() {
      this.settings = this.settingsService.bind(this.data);
    }, function() {
      beforeEach(function() {
        this.data = {
          Bindings: {
            test1: { binding1: 'a',
                     binding3: 'd' },
            test3: { binding2: 'c' },
          }
        };
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

    when('update(<settings>)', function() {
      this.ret = this.settingsService.update(this.settings);
    }, function() {
      beforeEach(function() {
        this.data = {
          Bindings: {
            test1: { binding1: 'a',
                     binding3: 'd' },
            test3: { binding2: 'c' },
          }
        };
        this.settings = this.settingsService.bind(this.data);
      });
      
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
        this.thenExpect(this.ret, function() {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.settings', {
              Bindings: {
                test1: { binding1: 'a',
                         binding3: 'd' },
                test2: { },
              }
            });
        });
      });
      
      it('should return settings object', function() {
        this.thenExpect(this.ret, function(settings) {
          expect(settings)
            .toBe(this.settings);
        });
      });
    });
  });
});
