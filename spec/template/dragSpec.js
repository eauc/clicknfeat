'use strict';

describe('move template', function() {
  describe('defaultMode service', function() {
    beforeEach(inject([
      'defaultMode',
      function(defaultModeService) {
        this.defaultModeService = defaultModeService;
        this.modesService = spyOnService('modes');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection' },
          modes: 'modes'
        };
        this.event = {
          target: { state: { stamp: 'stamp' } },
        };
      }
    ]));

    when('user starts dragging template', function() {
      this.defaultModeService.actions.dragStartTemplate(this.scope, this.event);
    }, function() {
      it('should set current selection', function() {
        expect(this.gameTemplateSelectionService.set)
          .toHaveBeenCalledWith('local', 'stamp', this.scope, 'selection');
      });

      it('should forward dragStart action to new mode', function() {
        expect(this.modesService.currentModeAction)
          .toHaveBeenCalledWith('dragStartTemplate', this.scope, this.event, null,
                                'modes');
      });
    });
  });

  describe('templateMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;
        this.modesService = spyOnService('modes');
        this.gameService = spyOnService('game');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection' },
          modes: 'modes',
          gameEvent: jasmine.createSpy('gameEvent')
        };
      }
    ]));

    when('user starts dragging template', function() {
      this.templateModeService.actions.dragStartTemplate(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };
      });

      it('should set current selection', function() {
        expect(this.gameTemplateSelectionService.set)
          .toHaveBeenCalledWith('local', 'stamp', this.scope, 'selection');
      });

      it('should update target position', function() {
        expect(this.event.target.state)
          .toEqual({ stamp: 'stamp', x: 250, y: 241, r: 180 });
      });

      it('should emit changeTemplate event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-stamp');
      });
    });

    when('user drags template', function() {
        this.templateModeService.actions.dragTemplate(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };
        this.templateModeService.actions.dragStartTemplate(this.scope, this.event);

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 },
        };
      });

      it('should update target position', function() {
        expect(this.event.target.state)
          .toEqual({ stamp: 'stamp', x: 270, y: 230, r: 180 });
      });

      it('should emit changeTemplate event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-stamp');
      });
    });

    when('user ends draging template', function() {
        this.templateModeService.actions.dragEndTemplate(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };
        this.templateModeService.actions.dragStartTemplate(this.scope, this.event);

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 },
        };
      });

      it('should restore dragStart template position', function() {
        expect(this.event.target.state)
          .toEqual({ stamp: 'stamp', x: 240, y: 240, r: 180 });
      });

      it('should execute onTemplates/setPosition command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onTemplates', 'setPosition',
                                { stamp: 'stamp', x: 270, y: 230, r: 180 }, ['stamp'],
                                this.scope, this.scope.game);
      });
    });
  });

  describe('template service', function() {
    beforeEach(inject([
      'template',
      function(templateService) {
        this.templateService = templateService;
      }
    ]));

    describe('setPosition(<pos>)', function() {
      beforeEach(function() {
        this.template = {
          state: { x: 240, y: 240, r: 180 }
        };
      });

      it('should set template position', function() {
        this.templateService.setPosition({ x: 15, y: 42 }, this.template);
        expect(this.template.state)
          .toEqual({ x: 15, y: 42, r: 180 });
      });

      it('should stay on board', function() {
        this.templateService.setPosition({ x: -15, y: 494 }, this.template);
        expect(this.template.state)
          .toEqual({ x: 0, y: 480, r: 180 });
      });
    });
  });
});
