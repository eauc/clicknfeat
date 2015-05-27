'use strict';

describe('record bindings', function() {
  describe('settingsBindingsCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.settingsService = spyOnService('settings');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.settings = {
            default: { 'Bindings': {
              'Default' : {},
              'Template': {}
            } },
            current: { 'Bindings': {
              'Default' : {},
              'Template': {}
            } }
          };
          this.scope.doUpdateSettings = jasmine.createSpy('doUpdateSettings');
          this.scope.deferDigest = jasmine.createSpy('deferDigest');

          $controller('settingsBindingsCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    describe('doRecordBinding(<action>)', function() {
      beforeEach(function() {
        self.Mousetrap = jasmine.createSpyObj('Mousetrap', [
          'record'
        ]);
      });

      it('should update recording flag', function() {
        this.scope.doRecordBinding('test');
        expect(this.scope.recording)
          .toBe('test');
      });

      it('should launch mousetrap record', function() {
        this.scope.doRecordBinding('test');
        expect(self.Mousetrap.record)
          .toHaveBeenCalledWith(jasmine.any(Function));
      });

      when('user records binding', function() {
        this.scope.mode = 'Template';
        this.scope.doRecordBinding('test');
        var on = self.Mousetrap.record.calls.first().args[0];
        this.sequence = [ 'a', 'b' ];
        on(this.sequence);
      }, function() {
        it('should update current bindings', function() {
          expect(this.scope.settings.current.Bindings.Template.test)
            .toBe('a b');
          expect(this.scope.doUpdateSettings)
            .toHaveBeenCalled();
        });

        it('should clear recording flag', function() {
          expect(this.scope.recording)
            .toBe(null);
        });
      });
    });
  });
});
