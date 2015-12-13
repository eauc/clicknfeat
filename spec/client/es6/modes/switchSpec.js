'use strict';

describe('modes', function() {
  describe('modesService', function() {
    beforeEach(inject([
      'modes',
      'allModes',
      function(modesService) {
        this.modesService = modesService;
        this.defaultModeService = spyOnService('defaultMode');
        this.defaultModeService.onLeave = jasmine.createSpy('onLeave');
        this.templateModeService = spyOnService('createTemplateMode');
        this.templateModeService.onEnter = jasmine.createSpy('onEnter');
      }
    ]));

    describe('switchToMode(<next>, <scope>)', function() {
      beforeEach(function(done) {
        this.scope = { 'this': 'scope' };
        this.scope.gameEvent = jasmine.createSpy('gameEvent');

        this.modesService.init(this.scope)
          .then((modes) => {
            this.modes = modes;
            this.modes.current = 'Default';

            this.defaultModeService.onEnter.calls.reset();
            
            done();
          });
      });

      function testModeSwitch(nextModeName, nextModeService) {
        it('should leave current mode', function() {
          this.thenExpect(this.ret, function() {
            expect(this.defaultModeService.onLeave)
              .toHaveBeenCalledWith(this.scope);
          });
        });

        it('should enter new mode', function() {
          this.thenExpect(this.ret, function() {
            expect(this[nextModeService].onEnter)
              .toHaveBeenCalledWith(this.scope);
          });
        });

        it('should change current mode', function() {
          this.thenExpect(this.ret, function() {
            expect(this.modesService.currentModeName(this.modes))
              .toBe(nextModeName);
          });
        });

        it('should emit switchMode event', function() {
          this.thenExpect(this.ret, function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('switchMode');
          });
        });

        when('leaveMode fails', function() {
          mockReturnPromise(this.defaultModeService.onLeave);
          this.defaultModeService.onLeave.rejectWith = 'reason';
        }, function() {
          it('should abort switch and reject promise', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');

              expect(this.modesService.currentModeName(this.modes))
                .toBe('Default');
              expect(this[nextModeService].onEnter)
                .not.toHaveBeenCalled();
              expect(this.scope.gameEvent)
                .not.toHaveBeenCalled();
            });
          });
        });

        when('enterMode fails', function() {
          mockReturnPromise(this[nextModeService].onEnter);
          this[nextModeService].onEnter.rejectWith = 'reason';
        }, function() {
          it('should abort switch and reject promise', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');

              expect(this.modesService.currentModeName(this.modes))
                .toBe('Default');
              expect(this.scope.gameEvent)
                .not.toHaveBeenCalled();
            });
          });
        });
      }
      
      when('we need to change mode', function() {
        this.ret = this.modesService
          .switchToMode('CreateTemplate', this.scope, this.modes);
      }, function() {
        testModeSwitch('CreateTemplate', 'templateModeService');
      });

      when('we are already in <next> mode', function() {
        this.ret = this.modesService
          .switchToMode('Default', this.scope, this.modes);
      }, function() {
        testModeSwitch('Default', 'defaultModeService');
      });

      when('<next> mode does not exist', function() {
        this.ret = this.modesService
          .switchToMode('Unknown', this.scope, this.modes);
      }, function() {
        it('should do nothing', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe(reason);
            
            expect(this.defaultModeService.onLeave)
              .not.toHaveBeenCalled();
            expect(this.defaultModeService.onEnter)
              .not.toHaveBeenCalled();
            expect(this.templateModeService.onEnter)
              .not.toHaveBeenCalled();

            expect(this.modesService.currentModeName(this.modes))
              .toBe('Default');
            expect(this.scope.gameEvent)
              .not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
