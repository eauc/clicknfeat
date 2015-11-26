'use strict';

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
      
        this.scope = { game: { models: 'models',
                               model_selection: 'selection',
                               template_selection: 'template_selection'
                             }
                     };
        this.scope.gameEvent = jasmine.createSpy('gameEvent');
        this.event = { 'click#': { target: { state: { stamp: 'stamp' } } } };
      }
    ]));

    when('user set model selection', function() {
      this.ret = this.defaultModeService.actions
        .setModelSelection(this.scope, this.event);
    }, function() {
      it('should set gameModelSelection', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setModelSelection', 'set', ['stamp'],
                                this.scope, this.scope.game);
        expect(this.ret).toBe('game.executeCommand.returnValue');
      });

      it('should clear gameTemplateSelection', function() {
        expect(this.gameTemplateSelectionService.clear)
          .toHaveBeenCalledWith('local', this.scope, 'template_selection');
        expect(this.scope.game.template_selection)
          .toBe('gameTemplateSelection.clear.returnValue');
      });
    });

    when('user toggle model selection', function() {
      this.ret = this.defaultModeService.actions
        .toggleModelSelection(this.scope, this.event);
    }, function() {
      it('should check if the model is already in local selection', function() {
        expect(this.gameModelSelectionService.in)
          .toHaveBeenCalledWith('local', 'stamp', 'selection');
      });
        
      when('model is not in selection', function() {
        this.gameModelSelectionService.in._retVal = false;
      }, function() {
        it('should add model to selection', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection', 'addTo', ['stamp'],
                                  this.scope, this.scope.game);
          expect(this.ret).toBe('game.executeCommand.returnValue');
        });
      });
        
      when('model is already in selection', function() {
        this.gameModelSelectionService.in._retVal = true;
      }, function() {
        it('should remove model from selection', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection', 'removeFrom', ['stamp'],
                                  this.scope, this.scope.game);
          expect(this.ret).toBe('game.executeCommand.returnValue');
        });
      });

      it('should clear gameTemplateSelection', function() {
        expect(this.gameTemplateSelectionService.clear)
          .toHaveBeenCalledWith('local', this.scope, 'template_selection');
        expect(this.scope.game.template_selection)
          .toBe('gameTemplateSelection.clear.returnValue');
      });
    });

    when('user starts dragging on map', function() {
      this.defaultModeService.actions
        .dragStartMap(this.scope, { start: 'start', now: 'now' });
    }, function() {
      it('should enable dragbox', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('enableDragbox', 'start', 'now');
      });
    });

    when('user drags on map', function() {
      this.defaultModeService.actions
        .dragMap(this.scope, { start: 'start', now: 'now' });
    }, function() {
      it('should update dragbox', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('enableDragbox', 'start', 'now');
      });
    });

    when('user select box', function() {
      this.ret = this.defaultModeService.actions
        .dragEndMap(this.scope, {
          start: { x: 180, y: 150 },
          now: { x: 240, y:120 }
        });
    }, function() {
      it('should disable dragbox', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('disableDragbox');
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
          expect(this.gameService.executeCommand)
            .not.toHaveBeenCalled();
        });
      });

      when('there are models in the dragbox', function() {
        this.gameModelsService.findStampsBetweenPoints.resolveWith = [ 'stamp1', 'stamp2' ];
      }, function() {
        it('should set selection to those models', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('setModelSelection', 'set', [ 'stamp1', 'stamp2' ],
                                    this.scope, this.scope.game);
            expect(result).toBe('game.executeCommand.returnValue');
          });
        });
      });
    });

    xwhen('user right-click on model', function() {
      this.defaultModeService.actions
        .rightClickModel(this.scope, this.event);
    }, function() {
      it('should open model selection detail', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('openSelectionDetail', 'model',
                                { state: { stamp: 'stamp' } });
      });

      it('should set gameModelSelection', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setModelSelection', 'set', ['stamp'],
                                this.scope, this.scope.game);
      });
    });
  });

  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
      
        this.scope = { game: 'game' };
      }
    ]));

    using([
      [ 'action' ],
      [ 'clickMap' ],
      [ 'rightClickMap' ],
    ], function(e, d) {
      when('user '+e.action, function() {
        this.ret = this.modelsModeService.actions[e.action](this.scope, 'event');
      }, function() {
        it('should clear local model selection', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection', 'clear', null,
                                  this.scope, this.scope.game);
          expect(this.ret).toBe('game.executeCommand.returnValue');
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

        this.scope = { scope: 'scope' };
        this.game = { model_selection: 'selection' };
      }
    ]));

    when('execute(<method>, <stamps>, <scope>, <game>)', function() {
      this.ret = this.setModelSelectionCommandService
        .execute(this.method, this.stamps, this.scope, this.game);
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
            .toHaveBeenCalledWith('local', this.stamps, this.scope, 'selection');
        });

        it('should return context', function() {
          expect(this.ret)
            .toEqual({
              after: { gameModelSelection: 'set.returnValue' },
              desc: '',
              do_not_log: true
            });
          expect(this.ret.after)
            .not.toBe(this.gameModelSelectionService.get._retVal);
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

    describe('replay(<ctxt>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          after: [ 'stamp1', 'stamp2' ],
          desc: '',
          do_not_log: true
        };
        
        this.setModelSelectionCommandService.replay(this.ctxt, this.scope, this.game);
      });

      it('should set remote selection to <ctxt.after>', function() {
        expect(this.gameModelSelectionService.set)
          .toHaveBeenCalledWith('remote', [ 'stamp1', 'stamp2' ],
                                this.scope, 'selection');
      });
    });

    // UNUSED
    // describe('undo(<ctxt>, <scope>, <game>)', function() {
    // });
  });

  describe('gameModelSelection service', function() {
    beforeEach(inject([
      'gameModelSelection',
      function(gameModelSelectionService) {
        this.gameModelSelectionService = gameModelSelectionService;
        this.modesService = spyOnService('modes');
        this.gameModelsService = spyOnService('gameModels');
        this.modelService = spyOnService('model');
        // this.modelService.isCharging._retVal = false;
        // this.modelService.isPlacing._retVal = false;
        spyOn(this.gameModelSelectionService, 'checkMode');
        
        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.scope.game = { models: 'models' };
        this.scope.modes = 'modes';
      }
    ]));

    function testChangeLocalSelection(whenMultipleSelection,
                                      whenSingleSelection) {
      it('should switch to Default mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('Default', this.scope, this.scope.modes);
      });
      
      when('resulting selection contains multiple models',
           whenMultipleSelection,
           function() {
             it('should disable singleModelSelection', function() {
               expect(this.scope.gameEvent)
                 .toHaveBeenCalledWith('disableSingleModelSelection');
             });
           });
      
      when('resulting selection contains single model',
           whenSingleSelection,
           function() {
             it('should not disable singleModelSelection', function() {
               expect(this.scope.gameEvent)
                 .not.toHaveBeenCalledWith('disableSingleModelSelection');
             });
           });
    }
    
    using([
      [ 'where' ],
      [ 'local' ],
      [ 'remote' ],
    ], function(e, d) {
      when('set('+e.where+', <stamps>, <scope>)', function() {
        this.ret = this.gameModelSelectionService.set(e.where, this.after,
                                                      this.scope, this.selection);
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
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-after1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-after2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-before1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-before2');
        });

        if(e.where === 'local') {
          testChangeLocalSelection(function() {
            this.after = [ 'after1', 'after2' ];
          }, function() {
            this.after = [ 'after1' ];
          });
        }
      });

      when('removeFrom('+e.where+', <stamps>, <scope>)', function() {
        this.ret = this.gameModelSelectionService.removeFrom(e.where, this.remove,
                                                             this.scope, this.selection);
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
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp3');
        });

        if(e.where === 'local') {
          testChangeLocalSelection(function() {
            this.remove = [ 'stamp3' ];
          }, function() {
            this.remove = [ 'stamp2' ];
          });
        }
      });

      when('addTo('+e.where+', <stamps>, <scope>)', function() {
        this.ret = this.gameModelSelectionService.addTo(e.where, this.add,
                                                        this.scope, this.selection);
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
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp3');
        });

        if(e.where === 'local') {
          testChangeLocalSelection(function() {
            this.add = [ 'stamp2' ];
          }, function() {
            this.add = [ 'stamp2' ];
            this.selection.local = [];
          });
        }
      });

      when('clear('+e.where+', <stamps>, <scope>)', function() {
        this.ret = this.gameModelSelectionService
          .clear(e.where, null, this.scope, this.selection);
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
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
        });

        if(e.where === 'local') {
          it('should check mode for selection', function() {   
            expect(this.modesService.switchToMode)
              .toHaveBeenCalledWith('Default', this.scope, this.scope.modes);
          });

          it('should disable singleModelSelection', function() {   
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('disableSingleModelSelection');
          });
        }
      });

      describe('inSingle(<where>, <stamp>)', function() {
        beforeEach(function() {
          this.selection = { local: [], remote: [] };
        });
        
        it('should check whether <stamp> is alone in selection', function() {
          this.selection = this.gameModelSelectionService.set(e.where, ['stamp'],
                                                              this.scope, this.selection);
          expect(this.gameModelSelectionService.inSingle(e.where, 'other', this.selection))
            .toBeFalsy();
          expect(this.gameModelSelectionService.inSingle(e.where, 'stamp', this.selection))
            .toBeTruthy();

          this.selection = this.gameModelSelectionService.set(e.where, ['stamp', 'other'],
                                                              this.scope, this.selection);
          expect(this.gameModelSelectionService.inSingle(e.where, 'stamp', this.selection))
            .toBeFalsy();
        });
      });
    });

    when('checkMode(<scope>)', function() {
      this.ret = this.gameModelSelectionService
        .checkMode(this.scope, this.selection);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.checkMode.and.callThrough();
        this.scope = { modes: 'modes',
                       game: { models: 'models' } };
        this.selection = { local: [] };
        // this.modelService.isCharging._retVal = false;
        // this.modelService.isPlacing._retVal = false;
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
            expect(this.modesService.switchToMode)
              .toHaveBeenCalledWith('Models', this.scope, 'modes');
          });
        });
      });

      when('<selection> is single', function() {
        this.selection.local = [ 'stamp' ];
      }, function() {
        it('should switch to mode for model', function() {
          this.thenExpect(this.ret, function() {
            expect(this.modesService.switchToMode)
              .toHaveBeenCalledWith('gameModels.modeForStamp.returnValue',
                                    this.scope, 'modes');
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
          locked: [ { state : { stamp: 'stamp3' } }, { state : { stamp: 'stamp4' } } ],
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
