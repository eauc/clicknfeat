describe('select model', function() {
  describe('defaultMode service', function() {
    beforeEach(inject([
      'defaultMode',
      function(defaultModeService) {
        this.defaultModeService = defaultModeService;

        this.gameService = spyOnService('game');

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStampsBetweenPoints);
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      
        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');
      
        this.state = { game: { models: 'models',
                               model_selection: 'selection',
                               template_selection: 'template_selection',
                               terrain_selection: 'terrain_selection'
                             },
                       event: jasmine.createSpy('event'),
                       changeEvent: jasmine.createSpy('changeEvent')
                     };
        this.state.event.and.callFake((e, l, u) => {
          if('Game.update' === e) {
            this.state.game = R.over(l, u, this.state.game);
          }
          return 'state.event.returnValue';
        });
        
        this.event = { 'click#': { target: { state: { stamp: 'stamp' } } } };
      }
    ]));

    when('user set model selection', function() {
      this.ret = this.defaultModeService.actions
        .setModelSelection(this.state, this.event);
    }, function() {
      it('should set gameModelSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'setModelSelection', ['set', ['stamp']]);
        });
      });

      it('should clear gameTemplateSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTemplateSelectionService.clear)
            .toHaveBeenCalledWith('local', this.state, 'template_selection');
          expect(this.state.game.template_selection)
            .toBe('gameTemplateSelection.clear.returnValue');
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

    when('user toggle model selection', function() {
      this.ret = this.defaultModeService.actions
        .toggleModelSelection(this.state, this.event);
    }, function() {
      it('should check if the model is already in local selection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameModelSelectionService.in)
            .toHaveBeenCalledWith('local', 'stamp', 'selection');
        });
      });
        
      when('model is not in selection', function() {
        this.gameModelSelectionService.in._retVal = false;
      }, function() {
        it('should add model to selection', function() {
          this.thenExpect(this.ret, () => {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'setModelSelection', [ 'addTo', ['stamp'] ]);
          });
        });
      });
        
      when('model is already in selection', function() {
        this.gameModelSelectionService.in._retVal = true;
      }, function() {
        it('should remove model from selection', function() {
          this.thenExpect(this.ret, () => {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'setModelSelection', ['removeFrom', ['stamp']]);
          });
        });
      });

      it('should clear gameTemplateSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTemplateSelectionService.clear)
            .toHaveBeenCalledWith('local', this.state, 'template_selection');
          expect(this.state.game.template_selection)
            .toBe('gameTemplateSelection.clear.returnValue');
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

    when('user starts dragging on map', function() {
      this.defaultModeService.actions
        .dragStartMap(this.state, { start: 'start', now: 'now' });
    }, function() {
      it('should enable dragbox', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.dragBox.enable', 'start', 'now');
      });
    });

    when('user drags on map', function() {
      this.defaultModeService.actions
        .dragMap(this.state, { start: 'start', now: 'now' });
    }, function() {
      it('should update dragbox', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.dragBox.enable', 'start', 'now');
      });
    });

    when('user select box', function() {
      this.ret = this.defaultModeService.actions
        .dragEndMap(this.state, {
          start: { x: 180, y: 150 },
          now: { x: 240, y:120 }
        });
    }, function() {
      it('should disable dragbox', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.dragBox.disable');
      });

      it('should lookup models inside the dragbox', function() {
        expect(this.gameModelsService.findStampsBetweenPoints)
          .toHaveBeenCalledWith({ x: 180, y: 120 },
                                { x: 240, y: 150 },
                               'models');
      });

      when('there is no model in the dragbox', function() {
        this.gameModelsService.findStampsBetweenPoints.rejectWith = 'reason';
      }, function() {
        it('should do nothing', function() {
          expect(this.state.event)
            .not.toHaveBeenCalled();
        });
      });

      when('there are models in the dragbox', function() {
        this.gameModelsService.findStampsBetweenPoints.resolveWith = [ 'stamp1', 'stamp2' ];
      }, function() {
        it('should set selection to those models', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'setModelSelection', [ 'set', [ 'stamp1', 'stamp2' ] ]);
          });
        });
      });
    });

    when('user right-click on model', function() {
      this.ret = this.defaultModeService.actions
        .modelSelectionDetail(this.state, this.event);
    }, function() {
      it('should open model selection detail', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.selectionDetail.open', 'model',
                                  { state: { stamp: 'stamp' } });
        });
      });

      it('should set gameModelSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'setModelSelection', ['set', ['stamp']]);
        });
      });

      it('should clear gameTemplateSelection', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTemplateSelectionService.clear)
            .toHaveBeenCalledWith('local', this.state, 'template_selection');
          expect(this.state.game.template_selection)
            .toBe('gameTemplateSelection.clear.returnValue');
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

  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
      
        this.state = { game: 'game',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    using([
      [ 'action' ],
      [ 'clickMap' ],
      [ 'rightClickMap' ],
    ], function(e) {
      when('user '+e.action, function() {
        this.ret = this.modelsModeService.actions[e.action](this.state, 'event');
      }, function() {
        it('should clear local model selection', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'setModelSelection', ['clear', null]);
        });
      });
    });
  });

  describe('setModelSelectionCommand service', function() {
    beforeEach(inject([
      'setModelSelectionCommand',
      function(setModelSelectionCommandService) {
        this.setModelSelectionCommandService = setModelSelectionCommandService;
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.state = { state: 'state' };
        this.game = { model_selection: 'selection' };
      }
    ]));

    when('execute(<method>, <stamps>, <state>, <game>)', function() {
      this.ret = this.setModelSelectionCommandService
        .execute(this.method, this.stamps, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamps1', 'stamp2' ];
        this.gameModelSelectionService.get._retVal = {
          gameModelSelection: 'set.returnValue'
        };
      });

      when('<method> exists', function() {
        this.method = 'set';
      }, function() {        
        it('should proxy <method> on gameModelSelectionService', function() {
          expect(this.gameModelSelectionService[this.method])
            .toHaveBeenCalledWith('local', this.stamps, this.state, 'selection');
        });

        it('should return context', function() {
          [this.ctxt] = this.ret;
          expect(this.ctxt)
            .toEqual({
              after: { gameModelSelection: 'set.returnValue' },
              desc: '',
              do_not_log: true
            });
        });
      });

      when('<method> does not exist', function() {
        this.method = 'whatever';
      }, function() {        
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('SetModelSelection unknown method whatever');
          });
        });
      });
    });

    describe('replay(<ctxt>, <state>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          after: [ 'stamp1', 'stamp2' ],
          desc: '',
          do_not_log: true
        };
        
        this.setModelSelectionCommandService.replay(this.ctxt, this.state, this.game);
      });

      it('should set remote selection to <ctxt.after>', function() {
        expect(this.gameModelSelectionService.set)
          .toHaveBeenCalledWith('remote', [ 'stamp1', 'stamp2' ],
                                this.state, 'selection');
      });
    });

    // UNUSED
    // describe('undo(<ctxt>, <state>, <game>)', function() {
    // });
  });

  describe('gameModelSelection service', function() {
    beforeEach(inject([
      'gameModelSelection',
      function(gameModelSelectionService) {
        this.gameModelSelectionService = gameModelSelectionService;

        this.gameModelsService = spyOnService('gameModels');
        this.modelService = spyOnService('model');
        spyOn(this.gameModelSelectionService, 'checkMode');
        
        this.state = jasmine.createSpyObj('state', [
          'changeEvent', 'event'
        ]);
        this.state.game = { models: 'models' };
        this.state.modes = 'modes';
      }
    ]));

    function testChangeLocalSelection() {
      it('should emit changeLocalModelSelection', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.model.selection.local.change');
      });
    }
    
    using([
      [ 'where' ],
      [ 'local' ],
      [ 'remote' ],
    ], function(e) {
      when('set('+e.where+', <stamps>, <state>)', function() {
        this.ret = this.gameModelSelectionService
          .set(e.where, this.after, this.state, this.selection);
      }, function() {        
        beforeEach(function() {
          this.selection = { local: [ 'before1', 'before2' ],
                             remote: [ 'before1', 'before2' ]
                           };
          this.after = [ 'after1', 'after2' ];
        });

        it('should set <where> selection', function() {
          expect(this.gameModelSelectionService.in(e.where, 'after1', this.ret))
            .toBeTruthy();
          expect(this.gameModelSelectionService.in(e.where, 'after2', this.ret))
            .toBeTruthy();
          expect(this.gameModelSelectionService.in(e.where, 'before1', this.ret))
            .toBeFalsy();
          expect(this.gameModelSelectionService.in(e.where, 'before2', this.ret))
            .toBeFalsy();
        });

        it('should emit changeModel event', function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.after1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.after2');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.before1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.before2');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('removeFrom('+e.where+', <stamps>, <state>)', function() {
        this.ret = this.gameModelSelectionService.removeFrom(e.where, this.remove,
                                                             this.state, this.selection);
      }, function() {
        beforeEach(function() {
          this.selection = { local: [ 'stamp1', 'stamp2' ],
                             remote: [ 'stamp1', 'stamp2' ]
                           };
          this.remove = ['stamp2', 'stamp3'];
        });
        
        it('should remove stamps from <where> selection', function() {
          expect(this.gameModelSelectionService.in(e.where, 'stamp1', this.ret))
            .toBeTruthy();
          expect(this.gameModelSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeFalsy();
          expect(this.gameModelSelectionService.in(e.where, 'stamp3', this.ret))
            .toBeFalsy();
        });

        it('should emit changeModel event', function() {
          // also emit stamp1 to update single selection styles
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp2');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp3');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('addTo('+e.where+', <stamps>, <state>)', function() {
        this.ret = this.gameModelSelectionService.addTo(e.where, this.add,
                                                        this.state, this.selection);
      }, function() {
        beforeEach(function() {
          this.add = ['stamp2', 'stamp3'];
          this.selection = { local: [ 'stamp1' ],
                             remote: [ 'stamp1' ]
                           };
        });
        
        it('should add stamps to <where> selection', function() {
          expect(this.gameModelSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeTruthy();
          expect(this.gameModelSelectionService.in(e.where, 'stamp3', this.ret))
            .toBeTruthy();
        });

        it('should emit changeModel event', function() {            
          // also emit stamp1 to update single selection styles
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp2');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp3');
        });

        if(e.where === 'local') {
          testChangeLocalSelection();
        }
      });

      when('clear('+e.where+', <stamps>, <state>)', function() {
        this.ret = this.gameModelSelectionService
          .clear(e.where, null, this.state, this.selection);
      }, function() {
        beforeEach(function() {
          this.selection = { local: ['stamp1', 'stamp2'],
                             remote: ['stamp1', 'stamp2']
                           };
        });

        it('should clear <where> selection', function() {
          expect(this.gameModelSelectionService.in(e.where, 'stamp1', this.ret))
            .toBeFalsy();
          expect(this.gameModelSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeFalsy();
        });

        it('should emit changeModel event', function() {            
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.change.stamp2');
        });

        if(e.where === 'local') {
          it('should emite changeLocalModelSelection', function() {   
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.model.selection.local.change');
          });
        }
      });

      describe('inSingle(<where>, <stamp>)', function() {
        beforeEach(function() {
          this.selection = { local: [], remote: [] };
        });
        
        it('should check whether <stamp> is alone in selection', function() {
          this.selection = this.gameModelSelectionService.set(e.where, ['stamp'],
                                                              this.state, this.selection);
          expect(this.gameModelSelectionService.inSingle(e.where, 'other', this.selection))
            .toBeFalsy();
          expect(this.gameModelSelectionService.inSingle(e.where, 'stamp', this.selection))
            .toBeTruthy();

          this.selection = this.gameModelSelectionService.set(e.where, ['stamp', 'other'],
                                                              this.state, this.selection);
          expect(this.gameModelSelectionService.inSingle(e.where, 'stamp', this.selection))
            .toBeFalsy();
        });
      });
    });

    when('checkMode(<state>)', function() {
      this.ret = this.gameModelSelectionService
        .checkMode(this.state, this.selection);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.checkMode.and.callThrough();
        this.state = { modes: 'modes',
                       game: { models: 'models' },
                       event: jasmine.createSpy('event')
                     };
        this.selection = { local: [] };
      });

      when('<selection> is empty', function() {
        this.selection.local = [];
      }, function() {
        it('should reject check', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No model selection');
          });
        });
      });

      when('<selection> is multiple', function() {
        this.selection.local = [ 'stamp1', 'stamp2' ];
      }, function() {
        it('should switch to Models mode', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Modes.switchTo','Models');
          });
        });
      });

      when('<selection> is single', function() {
        this.selection.local = [ 'stamp' ];
      }, function() {
        it('should switch to mode for model', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Modes.switchTo',
                                    'gameModels.modeForStamp.returnValue');
          });
        });
      });
    });
  });

  describe('gameModels service', function() {
    beforeEach(inject([
      'gameModels',
      function(gameModelsService) {
        this.gameModelsService = gameModelsService;
        this.modelService = spyOnService('model');
      }
    ]));

    describe('modeForStamp(<stamp>)', function() {
      beforeEach(function() {
        this.models = { active: [
          { state: { stamp: 'stamp1' } },
          { state: { stamp: 'stamp2' } },
        ], locked: [] };
        this.ret = this.gameModelsService
          .modeForStamp('stamp2', this.models);
      });

      it('should return mode for model <stamp>', function() {
        this.thenExpect(this.ret, function(mode) {
          expect(this.modelService.modeFor)
            .toHaveBeenCalledWith({ state: { stamp: 'stamp2' } });
          expect(mode).toBe('model.modeFor.returnValue');
        });
      });
    });

    when('findStampsBetweenPoints', function() {
      this.ret = this.gameModelsService
        .findStampsBetweenPoints('topleft', 'bottomright',
                                 this.models);
    }, function() {
      beforeEach(function() {
        this.models = {
          active: [ { state : { stamp: 'stamp1' } }, { state : { stamp: 'stamp2' } } ],
          locked: [ { state : { stamp: 'stamp3' } }, { state : { stamp: 'stamp4' } } ]
        };

        this.modelService.isBetweenPoints.and.callFake(function(s,e,m) {
          return ( m.state.stamp === 'stamp2' ||
                   m.state.stamp === 'stamp3'
                 );
        });
      });

      it('should find all models between the 2 points', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.modelService.isBetweenPoints)
            .toHaveBeenCalledWith('topleft', 'bottomright',
                                  { state: { stamp: 'stamp1' } });
          
          expect(result).toEqual([ 'stamp2', 'stamp3' ]);
        });
      });

      when('no stamps are found', function() {
        this.modelService.isBetweenPoints.and.returnValue(false);
      }, function() {
        it('should find all models between the 2 points', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No model found between points');
          });
        });
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
      }
    ]));

    when('modeFor', function() {
      this.ret = this.modelService.modeFor(this.model);
    }, function() {
      beforeEach(function() {
        this.model = { state: {} };
      });

      it('should return "Model" mode', function() {
        expect(this.ret).toBe('Model');
      });

      when('model is charging', function() {
        this.model = this.modelService.startCharge(this.model);
      }, function() {
        it('should return "ModelCharge" mode', function() {
          expect(this.ret).toBe('ModelCharge');
        });
      });

      when('model is placing', function() {
        this.model = this.modelService.startPlace(this.model);
      }, function() {
        it('should return "ModelPlace" mode', function() {
          expect(this.ret).toBe('ModelPlace');
        });
      });
    });

    describe('findStampsBetweenPoints', function() {
      beforeEach(function() {
        this.model = {
          state : { stamp: 'stamp1',
                    x: 240, y: 240
                  }
        };
      });

      using([
        [ 'tl', 'br', 'result' ],
        [ { x: 120, y: 120 }, {x: 180, y: 180 }, false ],
        [ { x: 300, y: 300 }, {x: 360, y: 360 }, false ],
        [ { x: 200, y: 120 }, {x: 300, y: 180 }, false ],
        [ { x: 120, y: 200 }, {x: 180, y: 300 }, false ],
        [ { x: 200, y: 200 }, {x: 300, y: 300 }, true ],
      ], function(e, d) {
        it('should find all models between the 2 points, '+d, function() {
          expect(this.modelService.isBetweenPoints(e.tl, e.br, this.model))
            .toBe(e.result);
        });
      });
    });
  });
});
