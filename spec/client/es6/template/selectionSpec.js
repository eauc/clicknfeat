describe('select template', function() {
  describe('defaultMode service', function() {
    beforeEach(inject([
      'defaultMode',
      function(defaultModeService) {
        this.defaultModeService = defaultModeService;
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      
        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');

        this.state = { game: { template_selection: 'selection',
                               terrain_selection: 'terrain_selection'},
                       changeEvent: jasmine.createSpy('changeEvent'),
                       event: jasmine.createSpy('event')
                     };
        this.state.event.and.callFake((e,l,u) => {
          if('Game.update'===e) {
            this.state.game = R.over(l,u,this.state.game);
          }
          return 'state.event.returnValue';
        });
        
        this.event = { 'click#': { target: { state: { stamp: 'stamp' } } } };
      }
    ]));

    when('user selects template', function() {
      this.ret = this.defaultModeService.actions
        .selectTemplate(this.state, this.event);
    }, function() {
      it('should set gameTemplateSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTemplateSelectionService.set)
            .toHaveBeenCalledWith('local', ['stamp'], this.state, 'selection');
          expect(this.state.game.template_selection)
            .toBe('gameTemplateSelection.set.returnValue');
        });
      });

      it('should clear gameTerrainSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTerrainSelectionService.clear)
            .toHaveBeenCalledWith('local', this.state, 'terrain_selection');
          expect(this.state.game.terrain_selection)
            .toBe('gameTerrainSelection.clear.returnValue');
        });
      });
    });

    when('user right-click on template', function() {
      this.ret = this.defaultModeService.actions
        .templateSelectionDetail(this.state, this.event);
    }, function() {
      it('should open template selection detail', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.selectionDetail.open', 'template',
                                  { state: { stamp: 'stamp' } });
        });
      });

      it('should set gameTemplateSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTemplateSelectionService.set)
            .toHaveBeenCalledWith('local', ['stamp'], this.state, 'selection');
          expect(this.state.game.template_selection)
            .toBe('gameTemplateSelection.set.returnValue');
        });
      });

      it('should clear gameTerrainSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTerrainSelectionService.clear)
            .toHaveBeenCalledWith('local', this.state, 'terrain_selection');
          expect(this.state.game.terrain_selection)
            .toBe('gameTerrainSelection.clear.returnValue');
        });
      });
    });
  });

  describe('templateMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.state = { game: { template_selection: 'selection' },
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

    using([
      [ 'action' ],
      [ 'clickMap' ],
      [ 'rightClickMap' ],
      [ 'modeBackToDefault' ],
    ], function(e) {
      when('user does '+e.action, function() {
        this.templateModeService
          .actions[e.action](this.state);
      }, function() {
        it('should clear gameTemplateSelection', function() {
          expect(this.gameTemplateSelectionService.clear)
            .toHaveBeenCalledWith('local', this.state, 'selection');
        });
      });
    });
  });

  describe('gameTemplateSelection service', function() {
    beforeEach(inject([
      'gameTemplateSelection',
      function(gameTemplateSelectionService) {
        this.gameTemplateSelectionService = gameTemplateSelectionService;
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.modesService = spyOnService('modes');

        this.state = jasmine.createSpyObj('state', [
          'changeEvent', 'event'
        ]);
        this.state.game = { templates: 'templates' };
        this.state.modes = 'modes';
      }
    ]));

    using([
      [ 'where' ],
      [ 'local' ],
      [ 'remote' ],
    ], function(e) {
      when('set(<where>, <stamp>, <state>)', function() {
        this.ret = this.gameTemplateSelectionService
          .set(e.where, ['stamp'], this.state, this.selection);
      }, function() {
        beforeEach(function() {
          this.selection = { local: [], remote: [] };
        });

        it('should set <where> selection', function() {
          expect(this.gameTemplateSelectionService.in(e.where, 'stamp', this.ret))
            .toBeTruthy();
        });

        it('should emit changeTemplate event', function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.change.stamp');
        });

        if(e.where === 'local') {
          it('should emit changeLocalTemplateSelection event', function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.template.selection.local.change');
          });
        }
        
        when('there is a previous selection', function() {
          this.selection[e.where] = [ 'previous' ];
        }, function() {
          it('should emit changeTemplate event', function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.template.change.previous');
          });
        });
      });

      when('removeFrom(<where>, <stamp>, <state>)', function() {
        this.ret = this.gameTemplateSelectionService.removeFrom(e.where, ['stamp'],
                                                                this.state, this.selection);
      }, function() {
        when('<stamp> is in previous selection', function() {
          this.selection = { local: ['stamp'], remote: ['stamp'] };
        }, function() {
          it('should clear <where> selection', function() {
            expect(this.gameTemplateSelectionService.in(e.where, 'stamp', this.ret))
              .toBeFalsy();
          });

          if(e.where === 'local') {
            it('should emit changeLocalTemplateSelection event', function() {
              expect(this.state.changeEvent)
                .toHaveBeenCalledWith('Game.template.selection.local.change');
            });
          }

          it('should emit changeTemplate event', function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.template.change.stamp');
          });
        });

        when('<stamp> is not in previous selection', function() {
          this.selection = { local: ['other'], remote: ['other'] };
        }, function() {
          it('should do nothing', function() {
            expect(this.gameTemplateSelectionService.in(e.where, 'other', this.selection))
              .toBeTruthy();
          });
        });
      });

      when('clear(<where>, <state>)', function() {
        this.ret = this.gameTemplateSelectionService.clear(e.where, this.state,
                                                           this.selection);
      }, function() {
        beforeEach(function() {
          this.selection = { local: ['stamp'], remote: ['stamp'] };
        });

        it('should clear <where> selection', function() {
          expect(this.gameTemplateSelectionService.in(e.where, 'stamp', this.ret))
            .toBeFalsy();
        });

        if(e.where === 'local') {
          it('should emit changeLocalTemplateSelection event', function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.template.selection.local.change');
          });
        }

        when('there is a previous selection', function() {
          this.selection[e.where] = [ 'previous' ];
        }, function() {
          it('should emit changeTemplate event', function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.template.change.previous');
          });
        });
      });
    });
  });

  describe('gameTemplates service', function() {
    beforeEach(inject([
      'gameTemplates',
      function(gameTemplatesService) {
        this.gameTemplatesService = gameTemplatesService;
        this.templates = {
          active: [ { state: { type: 'aoe', stamp: 'stamp1' } },
                    { state: { type: 'spray', stamp: 'stamp2' } } ],
          locked: [ { state: { type: 'wall', stamp: 'stamp3' } },
                    { state: { type: 'aoe', stamp: 'stamp4' } } ],
        };          
      }
    ]));

    describe('modeForStamp(<stamp>, <templates>)', function() {
      using([
        [ 'stamp'  , 'mode' ],
        [ 'stamp1' , 'aoeTemplate' ],
        [ 'stamp2' , 'sprayTemplate' ],
        [ 'stamp3' , 'wallTemplate' ],
        [ 'stamp4' , 'aoeTemplate' ],
      ], function(e, d) {
        it('should return correct mode for <stamp>, '+d, function() {
          this.ret = this.gameTemplatesService.modeForStamp(e.stamp, this.templates);

          this.thenExpect(this.ret, function(mode) {
            expect(mode).toBe(e.mode);
          });
        });
      });
    });
  });
});
