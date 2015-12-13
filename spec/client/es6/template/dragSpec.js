'use strict';

describe('drag template', function() {
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
      this.ret = this.templateModeService.actions
        .dragStartTemplate(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 },
        };
      });

      when('template is locked', function() {
        this.event.target.state.lk = true;
      }, function() {
        it('should reject action', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Template is locked');
          });
        });
      });
      
      it('should set current selection', function() {
        expect(this.gameTemplateSelectionService.set)
          .toHaveBeenCalledWith('local', ['stamp'],
                                this.scope, 'selection');
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
      this.ret = this.templateModeService.actions
        .dragTemplate(this.scope, this.event);
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

      when('template is locked', function() {
        this.event.target.state.lk = true;
      }, function() {
        it('should reject action', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Template is locked');
          });
        });
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
      this.ret = this.templateModeService.actions
        .dragEndTemplate(this.scope, this.event);
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

      when('template is locked', function() {
        this.event.target.state.lk = true;
      }, function() {
        it('should reject action', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Template is locked');
          });
        });
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

        expect(this.ret).toBe('game.executeCommand.returnValue');
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

      when('template is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should not set template position', function() {
          this.templateService.setPosition({ x: 15, y: 42 }, this.template);
          expect(R.pick(['x','y','r'], this.template.state))
            .toEqual({ x: 240, y: 240, r: 180 });
        });
      });
    });
  });
});
