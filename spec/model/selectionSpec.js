'use strict';

describe('select model', function() {
  describe('defaultMode service', function() {
    beforeEach(inject([
      'defaultMode',
      function(defaultModeService) {
        this.defaultModeService = defaultModeService;
        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { models: 'models',
                               model_selection: 'selection' } };
        this.scope.gameEvent = jasmine.createSpy('gameEvent');
        this.event = { target: { state: { stamp: 'stamp' } } };
        this.dom_event = { ctrlKey: false };
      }
    ]));

    when('user click on model', function() {
      this.defaultModeService.actions
        .clickModel(this.scope, this.event, this.dom_event);
    }, function() {
      when('ctrlKey is not active', function() {
        this.dom_event.ctrlKey = false;
      }, function() {
        it('should set gameModelSelection', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection', 'set', ['stamp'],
                                  this.scope, this.scope.game);
        });
      });

      when('ctrlKey is active', function() {
        this.dom_event.ctrlKey = true;
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
          });
        });
        
        when('model is already in selection', function() {
          this.gameModelSelectionService.in._retVal = true;
        }, function() {
          it('should remove model from selection', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('setModelSelection', 'removeFrom', ['stamp'],
                                    this.scope, this.scope.game);
          });
        });
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

    when('user ends dragging on map', function() {
      this.defaultModeService.actions
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
        this.gameModelsService.findStampsBetweenPoints._retVal = [];
      }, function() {
        it('should do nothing', function() {
          expect(this.gameService.executeCommand)
            .not.toHaveBeenCalled();
        });
      });

      when('there are models in the dragbox', function() {
        this.gameModelsService.findStampsBetweenPoints._retVal = [ 'stamp1', 'stamp2' ];
      }, function() {
        it('should set selection to those models', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection', 'set', [ 'stamp1', 'stamp2' ],
                                  this.scope, this.scope.game);
        });
      });
    });

    when('user right-click on model', function() {
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

    when('user click on map', function() {
      this.modelsModeService.actions
        .clickMap(this.scope, 'event');
    }, function() {
      it('should clear local model selection', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setModelSelection', 'clear', null,
                                this.scope, this.scope.game);
      });
    });

    when('user right click on map', function() {
      this.modelsModeService.actions
        .rightClickMap(this.scope, 'event');
    }, function() {
      it('should clear local model selection', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setModelSelection', 'clear', null,
                                this.scope, this.scope.game);
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
        it('should return Nil', function() {
          expect(this.ret)
            .toBe(undefined);
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

        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.scope.game = { models: 'models' };
        this.scope.modes = 'modes';
      }
    ]));

    using([
      [ 'where' ],
      [ 'local' ],
      [ 'remote' ],
    ], function(e, d) {
      when('set(<where>, <stamps>, <scope>)', function() {
        this.ret = this.gameModelSelectionService.set(e.where, this.after,
                                                      this.scope, this.selection);
      }, function() {
        beforeEach(function() {
          this.selection = { local: { stamps: [ 'before1', 'before2' ] },
                             remote: { stamps: [ 'before1', 'before2' ] }
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
          using([
            ['after', 'mode'],
            [[ 'after1', 'after2' ], 'Models'],
            [[ 'after1' ], 'Model'],
            [[ ], 'Default'],
          ], function(e, d) {
            when('<stamps> is '+e.after, function() {
              this.after = e.after;
            }, function() {
              it('should switch to mode '+e.mode, function() {
                expect(this.modesService.switchToMode)
                  .toHaveBeenCalledWith(e.mode, this.scope, 'modes');
              });
            });
          });
        }
      });

      when('removeFrom(<where>, <stamps>, <scope>)', function() {
        this.ret = this.gameModelSelectionService.removeFrom(e.where, this.remove,
                                                             this.scope, this.selection);
      }, function() {
        beforeEach(function() {
          this.remove = ['stamp2', 'stamp3'];
          this.selection = { local: { stamps: [ 'stamp1', 'stamp2' ] },
                             remote: { stamps: [ 'stamp1', 'stamp2' ] }
                           };
        });
        
        it('should remove stamps from <where> selection', function() {
          expect(this.gameModelSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeFalsy();
        });

        if(e.where === 'local') {
          using([
            ['remove', 'mode'],
            [[ 'stamp1', 'stamp2' ], 'Default'],
            [[ 'stamp1', 'stamp3' ], 'Model'],
            [[ 'stamp3' ], 'Models'],
          ], function(e, d) {
            when('<stamps> is '+e.remove, function() {
              this.remove = e.remove;
            }, function() {
              it('should switch to mode '+e.mode, function() {
                expect(this.modesService.switchToMode)
                  .toHaveBeenCalledWith(e.mode, this.scope, 'modes');
              });
            });
          });
        }

        it('should emit changeModel event', function() {            
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp3');
        });
      });

      when('addTo(<where>, <stamps>, <scope>)', function() {
        this.ret = this.gameModelSelectionService.addTo(e.where, this.add,
                                                        this.scope, this.selection);
      }, function() {
        beforeEach(function() {
          this.add = ['stamp2', 'stamp3'];
          this.selection = { local: { stamps: [ 'stamp1' ] },
                             remote: { stamps: [ 'stamp1' ] }
                           };
        });
        
        it('should add stamps to <where> selection', function() {
          expect(this.gameModelSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeTruthy();
          expect(this.gameModelSelectionService.in(e.where, 'stamp3', this.ret))
            .toBeTruthy();
        });

        if(e.where === 'local') {
          using([
            ['add', 'mode'],
            [[ 'stamp1' ], 'Model'],
            [[ 'stamp1', 'stamp3' ], 'Models'],
            [[ ], 'Model'],
          ], function(e, d) {
            when('<stamps> is '+e.add, function() {
              this.add = e.add;
            }, function() {
              it('should switch to mode '+e.mode, function() {
                expect(this.modesService.switchToMode)
                  .toHaveBeenCalledWith(e.mode, this.scope, 'modes');
              });
            });
          });
        }

        it('should emit changeModel event', function() {            
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp3');
        });
      });

      when('clear(<where>, <stamps>, <scope>)', function() {
        this.ret = this.gameModelSelectionService.clear(e.where,
                                                        null,
                                                        this.scope,
                                                        this.selection);
      }, function() {
        beforeEach(function() {
          this.selection = { local: { stamps: ['stamp1', 'stamp2'] },
                             remote: { stamps: ['stamp1', 'stamp2'] }
                           };
        });

        it('should clear <where> selection', function() {
          expect(this.gameModelSelectionService.in(e.where, 'stamp1', this.ret))
            .toBeFalsy();
          expect(this.gameModelSelectionService.in(e.where, 'stamp2', this.ret))
            .toBeFalsy();
        });

        if(e.where === 'local') {
          it('should switch to Default mode', function() {   
            expect(this.modesService.switchToMode)
              .toHaveBeenCalledWith('Default', this.scope, 'modes');
          });
        }

        it('should emit changeModel event', function() {            
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
        });
      });

      describe('inSingle(<where>, <stamp>)', function() {
        beforeEach(function() {
          this.selection = { local: { stamps: [] },
                             remote: { stamps: [] }
                           };
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
  });

  describe('gameModels service', function() {
    beforeEach(inject([
      'gameModels',
      function(gameModelsService) {
        this.gameModelsService = gameModelsService;
        this.modelService = spyOnService('model');
      }
    ]));

    describe('findStampsBetweenPoints', function() {
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

        this.ret = this.gameModelsService
          .findStampsBetweenPoints('topleft', 'bottomright',
                                   this.models);
      });

      it('should find all models between the 2 points', function() {
        expect(this.modelService.isBetweenPoints)
          .toHaveBeenCalledWith('topleft', 'bottomright',
                                { state: { stamp: 'stamp1' } });

        expect(this.ret)
          .toEqual([ 'stamp2', 'stamp3' ]);
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
