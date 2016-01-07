describe('delete template', function() {
  describe('templateMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;

        this.gameService = spyOnService('game');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.state = {
          game: { template_selection: 'selection' },
          event: jasmine.createSpy('event')
        };
      }
    ]));

    when('user deletes current template selection', function() {
      this.ret = this.templateModeService.actions.delete(this.state);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
      });

      it('should get current selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute deleteTemplates command', function() {
        expect(this.state.event)
          .toHaveBeenCalledWith('Game.command.execute',
                                'deleteTemplates', [ ['stamp'] ]);
      });
    });
  });

  describe('deleteTemplatesCommand service', function() {
    beforeEach(inject([
      'deleteTemplatesCommand',
      function(deleteTemplatesCommandService) {
        this.deleteTemplatesCommandService = deleteTemplatesCommandService;

        this.templateService = spyOnService('template');
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      }
    ]));

    when('execute(<stamps>, <state>, <game>)', function() {
      this.ret = this.deleteTemplatesCommandService
        .execute(this.stamps, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2'];
        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

        mockReturnPromise(this.gameTemplatesService.findAnyStamps);
        this.gameTemplatesService.findAnyStamps.resolveWith = [
          { state: { stamp: 'stamp' } }
        ];

        this.templateService.saveState.and.callFake(function(t) {
          return t.state.stamp+'State';
        });
      });

      it('should find <stamps> in <game> templates', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTemplatesService.findAnyStamps)
            .toHaveBeenCalledWith(['stamp1','stamp2'], 'templates');
        });
      });

      when('stamp is found', function() {
        this.gameTemplatesService.findAnyStamps.resolveWith = [
          { state: { stamp: 'stamp1' } },
          { state: { stamp: 'stamp2' } },
        ];
      }, function() {
        it('should save <stamps> state in context', function() {
          this.thenExpect(this.ret, function([ctxt]) {
            expect(this.templateService.saveState)
              .toHaveBeenCalledWith({ state: { stamp: 'stamp1' } });
            expect(this.templateService.saveState)
              .toHaveBeenCalledWith({ state: { stamp: 'stamp2' } });

            expect(ctxt.templates)
              .toEqual(['stamp1State', 'stamp2State']);
          });
        });
        
        it('should remove <stamps> from game templates', function() {
          this.thenExpect(this.ret, function([ctxt, game]) {
            expect(this.gameTemplatesService.removeStamps)
              .toHaveBeenCalledWith(['stamp1','stamp2'], jasmine.any(String));
            expect(game.templates)
              .toBe('gameTemplates.removeStamps.returnValue');
          });
        });

        it('should remove <stamps> from local selection', function() {
          this.thenExpect(this.ret, function([ctxt, game]) {
            expect(this.gameTemplateSelectionService.removeFrom)
              .toHaveBeenCalledWith('local', ['stamp1','stamp2'], this.state,
                                    'selection');
            expect(this.gameTemplateSelectionService.removeFrom)
              .toHaveBeenCalledWith('remote', ['stamp1','stamp2'], this.state,
                                    'gameTemplateSelection.removeFrom.returnValue');
            expect(game.template_selection)
              .toBe('gameTemplateSelection.removeFrom.returnValue');
          });
        });

        it('should emit createTemplate changeEvent', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.template.create');
          });
        });
      });
    });

    when('replay(<ctxt>, <state>, <game>)', function() {
      this.ret = this.deleteTemplatesCommandService
        .replay(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          templates: [ { stamp: 'stamp1' },
                       { stamp: 'stamp2' } ]
        };
        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };
      });

      it('should remove <stamps> from game templates', function() {
        expect(this.gameTemplatesService.removeStamps)
          .toHaveBeenCalledWith(['stamp1','stamp2'], jasmine.any(String));
        expect(this.ret.templates)
          .toBe('gameTemplates.removeStamps.returnValue');
      });

      it('should remove <stamps> from local selection', function() {
        expect(this.gameTemplateSelectionService.removeFrom)
          .toHaveBeenCalledWith('local', ['stamp1','stamp2'], this.state,
                                'selection');
        expect(this.gameTemplateSelectionService.removeFrom)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2'], this.state,
                                'gameTemplateSelection.removeFrom.returnValue');
        expect(this.ret.template_selection)
          .toBe('gameTemplateSelection.removeFrom.returnValue');
      });

      it('should emit createTemplate changeEvent', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.template.create');
      });
    });

    when('undo(<ctxt>, <state>, <game>)', function() {
      this.ret = this.deleteTemplatesCommandService
        .undo(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          templates: [ { stamp: 'stamp1' },
                       { stamp: 'stamp2' } ]
        };
        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

        mockReturnPromise(this.templateService.create);
        this.templateService.create.resolveWith = function(st) {
          return { state: st };
        };
      });

      it('should create templates from <ctxt.templates>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.templateService.create)
            .toHaveBeenCalledWith({ stamp: 'stamp1' });
          expect(this.templateService.create)
            .toHaveBeenCalledWith({ stamp: 'stamp2' });
        });
      });

      it('should add new templates to <game> templates', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.gameTemplatesService.add)
            .toHaveBeenCalledWith([ { state: { stamp: 'stamp1' } },
                                    { state: { stamp: 'stamp2' } } ],
                                  'templates');
          expect(game.templates)
            .toBe('gameTemplates.add.returnValue');
        });
      });

      it('should set remote templateSelection to new templates', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTemplateSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2'],
                                  this.state, 'selection');
        });
      });

      it('should emit createTemplate event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.create');
        });
      });
    });
  });
});
