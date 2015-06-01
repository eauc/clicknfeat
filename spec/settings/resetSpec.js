'use strict';

describe('reset settings', function() {
  describe('mainCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.settingsService = spyOnService('settings');
        mockReturnPromise(this.settingsService.init);
        
        this.stateService = jasmine.createSpyObj('$state', ['go']);

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          $controller('mainCtrl', { 
            '$scope': this.scope,
            '$state': this.stateService
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('doResetSettings(<data>)', function() {
      this.scope.doResetSettings('data');
    }, function() {
      it('should bind settings data', function() {
        expect(this.settingsService.bind)
          .toHaveBeenCalledWith('data');
      });

      it('should update settings', function() {
        expect(this.settingsService.update)
          .toHaveBeenCalledWith('settings.bind.returnValue');
        expect(this.scope.settings)
          .toBe('settings.update.returnValue');
      });
    });
  });

  describe('settings service', function() {
    beforeEach(inject([ 'settings', function(settingsService) {
      this.settingsService = settingsService;

      this.data = {
        Bindings: {
          test1: { binding1: 'a',
                   binding3: 'd' },
          test3: { binding2: 'c' },
        }
      };
      
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
    }]));

    describe('bind(<data>)', function() {
      beforeEach(function() {
        this.settings = this.settingsService.bind(this.data);
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

    describe('update(<settings>)', function() {
      beforeEach(function() {
        this.settings = this.settingsService.bind(this.data);
        this.ret = this.settingsService.update(this.settings);
      });
      
      it('should update modified settings', function() {
        expect(this.test1_updater)
          .toHaveBeenCalledWith({ binding1: 'a',
                                  binding3: 'd' });
        expect(this.test2_updater)
          .toHaveBeenCalledWith({});
      });
      
      it('should return settings object', function() {
        expect(this.ret)
          .toBe(this.settings);
      });
    });
  });
});
