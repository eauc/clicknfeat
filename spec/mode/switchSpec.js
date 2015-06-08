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
        this.templateModeService = spyOnService('aoeTemplateMode');
      }
    ]));

    describe('switchToMode(<next>, <scope>)', function() {
      beforeEach(function() {
        this.scope = { 'this': 'scope' };
        this.scope.gameEvent = jasmine.createSpy('gameEvent');

        this.modes = this.modesService.init(this.scope);
        this.modes.current = 'Default';
      });

      when('we need to change mode', function() {
        this.modesService.switchToMode('aoeTemplate', this.scope, this.modes);
      }, function() {
        it('should leave current mode', function() {
          expect(this.defaultModeService.onLeave)
            .toHaveBeenCalledWith(this.scope);
        });

        it('should enter new mode', function() {
          expect(this.templateModeService.onEnter)
            .toHaveBeenCalledWith(this.scope);
        });

        it('should change current mode', function() {
          expect(this.modesService.currentModeName(this.modes))
            .toBe('aoeTemplate');
        });

        it('should emit switchMode event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('switchMode');
        });
      });

      when('we are already in <next> mode', function() {
        this.modesService.switchToMode('Default', this.scope, this.modes);
      }, function() {
        it('should do nothing', function() {
          expect(this.defaultModeService.onLeave)
            .not.toHaveBeenCalled();
          expect(this.templateModeService.onEnter)
            .not.toHaveBeenCalled();
          expect(this.modesService.currentModeName(this.modes))
            .toBe('Default');
          expect(this.scope.gameEvent)
            .not.toHaveBeenCalled();
        });
      });

      when('<next> mode does not exist', function() {
        this.modesService.switchToMode('Unknown', this.scope, this.modes);
      }, function() {
        it('should do nothing', function() {
          expect(this.defaultModeService.onLeave)
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
