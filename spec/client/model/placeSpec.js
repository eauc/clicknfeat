'use strict';

describe('model place', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;

        this.gameService = spyOnService('game');
        mockReturnPromise(this.gameService.executeCommand);
        this.gameService.executeCommand.resolveWith = 'game.executeCommand.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       modes: 'modes',
                       doSwitchToMode: jasmine.createSpy('doSwitchToMode'),
                     };
      }
    ]));

    when('user starts place on model', function() {
      this.ret = this.modelModeService.actions
        .startPlace(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      });

      it('should start place for model', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'startPlace', ['stamp'],
                                  this.scope, this.scope.game);
        });
      });

      it('should switch to ModelPlace mode', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.doSwitchToMode)
            .toHaveBeenCalledWith('ModelPlace');
        });
      });
    });
  });

  describe('modelPlaceMode service', function() {
    beforeEach(inject([
      'modelPlaceMode',
      function(modelPlaceModeService) {
        this.modelPlaceModeService = modelPlaceModeService;

        this.modesService = spyOnService('modes');

        this.gameService = spyOnService('game');
        mockReturnPromise(this.gameService.executeCommand);
        this.gameService.executeCommand.resolveWith = 'game.executeCommand.returnValue';

        this.modelService = spyOnService('model');
        // this.modelService.isCharging._retVal = false;

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';

        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.modelsModeService = spyOnService('modelsMode');
        // spyOn(this.modelsModeService.actions, 'clickModel');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       modes: 'modes',
                       doSwitchToMode: jasmine.createSpy('doSwitchToMode'),
                     };
      }
    ]));

    when('user ends place on model', function() {
      this.ret = this.modelPlaceModeService.actions
        .endPlace(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      });

      it('should end place for model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'endPlace', ['stamp'],
                                this.scope, this.scope.game);
      });

      it('should switch to Model mode', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.doSwitchToMode)
            .toHaveBeenCalledWith('Model');
        });
      });
    });

    when('user set target model', function() {
      this.ret = this.modelPlaceModeService.actions
        .setTargetModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp.resolveWith = {
          state: { stamp: 'stamp' }
        };
        this.target = { state: { stamp: 'target' } };
        this.event = { 'click#': { target: this.target } };
      });

      when('target is the same as selection', function() {
        this.target.state.stamp = 'stamp';
      }, function() {
        it('should do nothing', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameService.executeCommand)
              .not.toHaveBeenCalled();
          });
        });
      });

      when('target is another model', function() {
        this.target.state.stamp = 'target';
      }, function() {
        it('should set place target for model', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setPlaceTarget',
                                    'factions', this.target,
                                    ['stamp'], this.scope, this.scope.game);
            expect(result).toBe('game.executeCommand.returnValue');
          });
        });
      });
    });

    when('user set origin model', function() {
      this.ret = this.modelPlaceModeService.actions
        .setOriginModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp.resolveWith = {
          state: { stamp: 'stamp' }
        };
        this.target = { state: { stamp: 'target' } };
        this.event = { 'click#': { target: this.target } };
      });

      when('origin is the same as selection', function() {
        this.target.state.stamp = 'stamp';
      }, function() {
        it('should do nothing', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameService.executeCommand)
              .not.toHaveBeenCalled();
          });
        });
      });

      when('origin is another model', function() {
        this.target.state.stamp = 'origin';
      }, function() {
        it('should set place target for model', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setPlaceOrigin',
                                    'factions', this.target,
                                    ['stamp'], this.scope, this.scope.game);
            expect(result).toBe('game.executeCommand.returnValue');
          });
        });
      });
    });

    using([
      ['action'          , 'flipped' , 'move'        , 'small'],
      ['moveFront'       , false     , 'moveFront'   , false  ],
      ['moveFront'       , true      , 'moveFront'   , false  ],
      ['moveFrontSmall'  , false     , 'moveFront'   , true   ],
      ['moveFrontSmall'  , true      , 'moveFront'   , true   ],
      ['moveBack'        , false     , 'moveBack'    , false  ],
      ['moveBack'        , true      , 'moveBack'    , false  ],
      ['moveBackSmall'   , false     , 'moveBack'    , true   ],
      ['moveBackSmall'   , true      , 'moveBack'    , true   ],
      ['rotateRight'     , false     , 'rotateRight' , false  ],
      ['rotateRight'     , true      , 'rotateRight' , false  ],
      ['rotateRightSmall', false     , 'rotateRight' , true   ],
      ['rotateRightSmall', true      , 'rotateRight' , true   ],
      ['shiftUp'         , false     , 'shiftUp'     , false  ],
      ['shiftUp'         , true      , 'shiftDown'   , false  ],
      ['shiftUpSmall'    , false     , 'shiftUp'     , true   ],
      ['shiftUpSmall'    , true      , 'shiftDown'   , true   ],
      ['shiftDown'       , false     , 'shiftDown'   , false  ],
      ['shiftDown'       , true      , 'shiftUp'     , false  ],
      ['shiftDownSmall'  , false     , 'shiftDown'   , true   ],
      ['shiftDownSmall'  , true      , 'shiftUp'     , true   ],
      ['shiftLeft'       , false     , 'shiftLeft'   , false  ],
      ['shiftLeft'       , true      , 'shiftRight'  , false  ],
      ['shiftLeftSmall'  , false     , 'shiftLeft'   , true   ],
      ['shiftLeftSmall'  , true      , 'shiftRight'  , true   ],
      ['shiftRight'      , false     , 'shiftRight'  , false  ],
      ['shiftRight'      , true      , 'shiftLeft'   , false  ],
      ['shiftRightSmall' , false     , 'shiftRight'  , true   ],
      ['shiftRightSmall' , true      , 'shiftLeft'   , true   ],
    ], function(e, d) {
      when('user '+e.action+' on model, '+d, function() {
        this.ret = this.modelPlaceModeService
          .actions[e.action](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameModelSelectionService.get._retVal = ['stamp'];
          this.scope.ui_state = { flip_map : e.flipped };
        });

        it('should place-move model', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', e.move+'Place',
                                  'factions', e.small,
                                  ['stamp'], this.scope, this.scope.game);
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

        this.modelService = spyOnService('model');

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';

        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.promptService.prompt.resolveWith = 71;
        
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    when('user set place max length', function() {
      this.ret = this.modelsModeService.actions
        .setPlaceMaxLength(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService.placeMaxLength._retVal = 42;
      });

      it('should fetch first model\'s place max length', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'models');
        this.thenExpect(this.ret, function() {
          expect(this.modelService.placeMaxLength)
            .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
        });
      });
      
      it('should prompt user for max length', function() {
        this.thenExpect(this.ret, function() {
          expect(this.promptService.prompt)
            .toHaveBeenCalledWith('prompt',
                                  'Set place max length :',
                                  42);
        });
      });

      when('user cancel prompt', function() {
        this.promptService.prompt.rejectWith = 'canceled';
      }, function() {        
        it('should reset model\'s place max length', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels',
                                    'setPlaceMaxLength', 'factions', null,
                                    ['stamp1','stamp2'], this.scope, this.scope.game);
            expect(result).toBe('game.executeCommand.returnValue');
          });
        });
      });

      using([
        [ 'value', 'max' ],
        [ 42     , 42    ],
        [ 0      , null  ],
      ], function(e, d) {
        when('user validates prompt, '+d, function() {
          this.promptService.prompt.resolveWith = e.value;
        }, function() {
          it('should set model\'s place max length', function() {
            this.thenExpect(this.ret, function(result) {
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels',
                                      'setPlaceMaxLength', 'factions', e.max,
                                      ['stamp1','stamp2'], this.scope, this.scope.game);
              expect(result).toBe('game.executeCommand.returnValue');
            });
          });
        });
      });
    });

    when('user toggles placeWithin on models', function() {
      this.ret = this.modelsModeService.actions
        .togglePlaceWithin(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
      });
      
      using([
        ['first', 'set'],
        [ true  , false],
        [ false , true ],
      ], function(e, d) {
        when('first selected model\'s placeWithin is '+e.first, function() {
          this.modelService.placeWithin._retVal = e.first;
        }, function() {
          it('should toggle placeWithin on local selection, '+d, function() {
            expect(this.gameModelSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('stamp1', 'models');
            this.thenExpect(this.ret, function(result) {
              expect(this.modelService.placeWithin)
                .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels',
                                      'setPlaceWithin', 'factions', e.set,
                                      this.gameModelSelectionService.get._retVal,
                                      this.scope, this.scope.game);
              expect(result).toBe('game.executeCommand.returnValue');
            });
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
        spyOn(this.modelService, 'checkState')
          .and.returnValue('model.checkState.returnValue');
      }
    ]));

    when('startPlace()', function() {
      this.ret = this.modelService.startPlace(this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { x: 240, y:240, r: 180 }
        };
      });
      
      it('should start place on model', function() {
        expect(this.model.state.pla)
          .toEqual({
            s: { x: 240, y: 240, r: 180 }
          });
        expect(this.modelService.isPlacing(this.model))
          .toBeTruthy();
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject place start', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model is locked');

            expect(this.modelService.isPlacing(this.model))
              .toBeFalsy();
          });
        });
      });
    });

    when('endPlace()', function() {
      this.modelService.endPlace(this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { x: 240, y:240, r: 180,
                   sta: {
                     s: { x: 240, y: 240 }
                   }
                 }
        };
      });
      
      it('should end place on model', function() {
        expect(this.model.state.pla)
          .toBe(null);
        expect(this.modelService.isPlacing(this.model))
          .toBeFalsy();
      });
    });

    when('setPlaceTarget(<factions>, <target>)', function() {
      this.ret = this.modelService
        .setPlaceTarget('factions', this.target, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info',
                   x: 240, y:240, r: 180,
                   pla: {
                     s: { x: 160, y: 160 }
                   }
                 }
        };
        this.target = {
          state: { x: 120, y: 120, stamp: 'target' }
        };
      });
      
      it('should orient place lane toward <target>', function() {
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 80, y: 79.99999999999999, r: 180 });
        expect(R.pick(['x','y','r'], this.model.state.pla.s))
          .toEqual({ x: 160, y: 160, r: -45 });
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
          .toHaveBeenCalledWith('factions', null, this.model);
        expect(this.ret).toBe('model.checkState.returnValue');
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject place start', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model is locked');

            expect(R.pick(['x','y','r'], this.model.state))
              .toEqual({ x: 240, y: 240, r: 180 });
            expect(R.pick(['x','y','r'], this.model.state.pla.s))
              .toEqual({ x: 160, y: 160 });
          });
        });
      });
    });

    when('setPlaceOrigin(<factions>, <origin>)', function() {
      this.ret = this.modelService
        .setPlaceOrigin('factions', this.origin, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info',
                   x: 240, y:240, r: 180,
                   pla: {
                     s: { x: 160, y: 160 }
                   }
                 }
        };
        this.origin = {
          state: { x: 120, y: 240, stamp: 'origin' }
        };
      });
      
      it('should orient place lane toward <target>', function() {
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 210.59644256269408, y: 58.807114874611855, r: 180 });
        expect(R.pick(['x','y','r'], this.model.state.pla.s))
          .toEqual({ x: 160, y: 160, r: 26.56505117707799 });
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
          .toHaveBeenCalledWith('factions', null, this.model);
        expect(this.ret).toBe('model.checkState.returnValue');
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject place start', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model is locked');

            expect(R.pick(['x','y','r'], this.model.state))
              .toEqual({ x: 240, y: 240, r: 180 });
            expect(R.pick(['x','y','r'], this.model.state.pla.s))
              .toEqual({ x: 160, y: 160 });
          });
        });
      });
    });
    
    when('setPlaceMaxLength(<length>)', function() {
      this.ret = this.modelService
        .setPlaceMaxLength('factions', 42, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', pml: [] }
        };
      });
      
      it('should set place max length on model', function() {
        expect(this.modelService.placeMaxLength(this.model))
          .toBe(42);
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
          .toHaveBeenCalledWith('factions', null, this.model);
        expect(this.ret).toBe('model.checkState.returnValue');
      });
    });

    using([
      [ 'move', 'start',
        'start_result', 'result',
        'start_small_result', 'small_result' ],
      [ 'rotateLeftPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 80 },
        { x: 239.39231012048833, y: 233.0540728933228, r: 180 },
        { x: 200, y: 240, r: 88 },
        { x: 239.97563308076383, y: 238.60402013189994, r: 180 } ],
      [ 'rotateRightPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 100 },
        { x: 239.39231012048833, y: 246.9459271066772, r: 180 },
        { x: 200, y: 240, r: 92 },
        { x: 239.97563308076383, y: 241.39597986810003, r: 180 } ],
      // place length === 0
      [ 'rotateLeftPlace',
        { x: 240, y: 240, r: 90 },
        { x: 240, y: 240, r: 80 }, { x: 240, y: 240, r: 180 },
        { x: 240, y: 240, r: 88 }, { x: 240, y: 240, r: 180 }, ],
      // place length === 0
      [ 'rotateRightPlace',
        { x: 240, y: 240, r: 90 },
        { x: 240, y: 240, r: 100 }, { x: 240, y: 240, r: 180 },
        { x: 240, y: 240, r: 92 }, { x: 240, y: 240, r: 180 }, ],
      [ 'moveFrontPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 245, y: 240, r: 180 } ],
      [ 'moveBackPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 235, y: 240, r: 180 } ],
      [ 'shiftLeftPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 239, y: 240, r: 180 } ],
      [ 'shiftRightPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 241, y: 240, r: 180 } ],
      [ 'shiftUpPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 240, y: 230, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 240, y: 239, r: 180 } ],
      [ 'shiftDownPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 240, y: 250, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 240, y: 241, r: 180 } ],
    ], function(e) {
      when(e.move+'(<small>)', function() {
        this.ret = this.modelService[e.move]('factions', this.small, this.model);
      }, function() {
        beforeEach(function() {
          this.model = {
            state: { info: 'info', x: 240, y: 240, r: 180,
                     pla: { s: e.start }
                   }
          };
        });

        using([
          [ 'small', 'result', 'start_result' ],
          [ false  , e.result, e.start_result ],
          [ true   , e.small_result, e.start_small_result ],
        ], function(ee, dd) {
          when(dd, function() {
            this.small = ee.small;
          }, function() {
            it('should '+e.move+' model', function() {
              expect(R.pick(['x','y','r'], this.model.state))
                .toEqual(ee.result);
              expect(this.model.state.pla.s)
                .toEqual(ee.start_result);
            });
          });
        });

        it('should check state', function() {
          expect(this.modelService.checkState)
            .toHaveBeenCalledWith('factions', null, this.model);
          expect(this.ret).toBe('model.checkState.returnValue');
        });
        

        when('model is locked', function() {
          this.modelService.setLock(true, this.model);
        }, function() {
          it('should reject place start', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('Model is locked');

              expect(R.pick(['x','y','r'], this.model.state))
                .toEqual({ x: 240, y: 240, r: 180 });
            });
          });
        });
      });
    });
  });
});
