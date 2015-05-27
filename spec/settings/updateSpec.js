'use strict';

describe('update settings', function() {
  describe('settingsCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.settingsService = spyOnService('settings');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.settings = {
            default: { 'Bindings': {} }
          };
          this.state = {
            current: { name: 'settings.bindings' }
          };

          $controller('settingsCtrl', { 
            '$scope': this.scope,
            '$state': this.state,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    describe('doUpdateSettings()', function() {
      it('should update settings', function() {
        this.scope.doUpdateSettings();
        expect(this.settingsService.update)
          .toHaveBeenCalledWith(this.scope.settings);
      });
    });
  });

  describe('settings service', function() {
    beforeEach(inject([ 'settings', function(settingsService) {
      this.settingsService = settingsService;
    }]));

    describe('update()', function() {
      beforeEach(function() {
        this.settings = {
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
        this.settingsService.registerBindings('test1',
                                              this.default_settings.Bindings.test1,
                                              this.test1_updater);
        this.test2_updater = jasmine.createSpy('test2_updater');
        this.settingsService.registerBindings('test2',
                                              this.default_settings.Bindings.test2,
                                              this.test2_updater);
      });
      
      it('should update modified settings', function() {
        this.settingsService.update({
          current: this.settings
        });

        expect(this.test1_updater)
          .toHaveBeenCalledWith({ binding1: 'a',
                                  binding3: 'd' });
      });
      
      it('should store modified settings', function() {
        this.settingsService.update({
          current: this.settings
        });

        expect(this.localStorage.setItem)
          .toHaveBeenCalledWith('clickApp.settings', [
            '{"Bindings":',
            '{"test1":',
            '{"binding1":"a",',
            '"binding3":"d"},',
            '"test3":',
            '{"binding2":"c"}',
            '}}'
          ].join(''));
      });
    });
  });
});
