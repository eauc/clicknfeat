describe('drag template', function() {
  describe('templateMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;
        this.modesService = spyOnService('modes');
        this.gameService = spyOnService('game');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.state = {
          game: { template_selection: 'selection' },
          modes: 'modes',
          changeEvent: jasmine.createSpy('changeEvent'),
          event: jasmine.createSpy('event')
        };
        this.state.event.and.callFake((e,l,u) => {
          if('Game.update'===e) {
            this.state.game = R.over(l,u,this.state.game);
          }
          return 'state.event.returnValue';
        });
      }
    ]));

    when('user starts dragging template', function() {
      this.ret = this.templateModeService.actions
        .dragStartTemplate(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
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
                                this.state, 'selection');
      });

      it('should update target position', function() {
        expect(this.event.target.state)
          .toEqual({ stamp: 'stamp', x: 250, y: 241, r: 180 });
      });

      it('should emit changeTemplate event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.template.change.stamp');
      });
    });

    when('user drags template', function() {
      this.ret = this.templateModeService.actions
        .dragTemplate(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };
        this.templateModeService.actions.dragStartTemplate(this.state, this.event);

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
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
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.template.change.stamp');
      });
    });

    when('user ends draging template', function() {
      this.ret = this.templateModeService.actions
        .dragEndTemplate(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };
        this.templateModeService.actions.dragStartTemplate(this.state, this.event);

        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 230, y: 190 }
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
        expect(this.state.event)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTemplates', [ 'setPosition',
                                                 [{ stamp: 'stamp', x: 270, y: 230, r: 180 }],
                                                 ['stamp']
                                               ]);
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
        this.template = this.templateService
          .setPosition({ x: 15, y: 42 }, this.template);
        expect(this.template.state)
          .toEqual({ x: 15, y: 42, r: 180 });
      });

      it('should stay on board', function() {
        this.template = this.templateService
          .setPosition({ x: -15, y: 494 }, this.template);
        expect(this.template.state)
          .toEqual({ x: 0, y: 480, r: 180 });
      });

      when('template is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should not set template position', function() {
          this.ret = this.templateService
            .setPosition({ x: 15, y: 42 }, this.template);

          this.thenExpectError(this.ret, (reason) => {
            expect(reason).toBe('Template is locked');
          });
        });
      });
    });
  });
});
