'use strict';

xdescribe('model place', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;
        this.modesService = spyOnService('modes');
        this.gameService = spyOnService('game');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       modes: 'modes',
                     };
      }
    ]));

    when('user starts place on model', function() {
      this.modelModeService.actions.startPlace(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      });

      it('should start place for model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'startPlace', ['stamp'],
                                this.scope, this.scope.game);
      });

      it('should switch to ModelPlace mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('ModelPlace', this.scope, 'modes');
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
        this.modelService = spyOnService('model');
        this.modelService.isCharging._retVal = false;
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.modelsModeService = spyOnService('modelsMode');
        spyOn(this.modelsModeService.actions, 'clickModel');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       modes: 'modes',
                     };
      }
    ]));

    when('user ends place on model', function() {
      this.modelPlaceModeService.actions.endPlace(this.scope);
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
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('Model', this.scope, 'modes');
      });
    });

    when('user shift click on model', function() {
      this.modelPlaceModeService.actions
        .clickModel(this.scope, this.event, { shiftKey: true });
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp._retVal = {
          state: { stamp: 'stamp' }
        };
        this.event = { target: { state: { stamp: 'target' } } };
      });

      when('target is the same as selection', function() {
        this.event.target.state.stamp = 'stamp';
      }, function() {
        it('should forward to modelsMode', function() {
          expect(this.modelsModeService.actions.clickModel)
            .toHaveBeenCalledWith(this.scope, this.event, { shiftKey: true });
        });
      });

      when('target is another model', function() {
      }, function() {
        it('should set place target for model', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'setPlaceTarget',
                                  this.scope.factions, this.event.target,
                                  ['stamp'], this.scope, this.scope.game);
        });
      });
    });

    when('user ctrl click on model', function() {
      this.modelPlaceModeService.actions
        .clickModel(this.scope, this.event, { ctrlKey: true });
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp._retVal = {
          state: { stamp: 'stamp' }
        };
        this.event = { target: { state: { stamp: 'target' } } };
      });

      when('target is the same as selection', function() {
        this.event.target.state.stamp = 'stamp';
      }, function() {
        it('should forward to modelsMode', function() {
          expect(this.modelsModeService.actions.clickModel)
            .toHaveBeenCalledWith(this.scope, this.event, { ctrlKey: true });
        });
      });

      when('target is another model', function() {
      }, function() {
        it('should set place target for model', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'setPlaceOrigin',
                                  this.scope.factions, this.event.target,
                                  ['stamp'], this.scope, this.scope.game);
        });
      });
    });

    using([
      ['move'            , 'cmd'         , 'flipMove'    , 'small'],
      ['moveFront'       , 'moveFront'   , 'moveFront'   , false  ],
      ['moveFrontSmall'  , 'moveFront'   , 'moveFront'   , true   ],
      ['moveBack'        , 'moveBack'    , 'moveBack'    , false  ],
      ['moveBackSmall'   , 'moveBack'    , 'moveBack'    , true   ],
      ['rotateLeft'      , 'rotateLeft'  , 'rotateLeft'  , false  ],
      ['rotateLeftSmall' , 'rotateLeft'  , 'rotateLeft'  , true   ],
      ['rotateRight'     , 'rotateRight' , 'rotateRight' , false  ],
      ['rotateRightSmall', 'rotateRight' , 'rotateRight' , true   ],
      ['shiftUp'         , 'shiftUp'     , 'shiftDown'   , false  ],
      ['shiftUpSmall'    , 'shiftUp'     , 'shiftDown'   , true   ],
      ['shiftDown'       , 'shiftDown'   , 'shiftUp'     , false  ],
      ['shiftDownSmall'  , 'shiftDown'   , 'shiftUp'     , true   ],
      ['shiftLeft'       , 'shiftLeft'   , 'shiftRight'  , false  ],
      ['shiftLeftSmall'  , 'shiftLeft'   , 'shiftRight'  , true   ],
      ['shiftRight'      , 'shiftRight'  , 'shiftLeft'   , false  ],
      ['shiftRightSmall' , 'shiftRight'  , 'shiftLeft'   , true   ],
    ], function(e, d) {
      when('user '+e.move+' on model', function() {
        this.modelPlaceModeService.actions[e.move](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameModelSelectionService.get._retVal = ['stamp'];
          spyOn(this.modelsModeService.actions, e.move);
        });

        it('should place-move model', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', e.cmd+'Place',
                                  this.scope.factions, e.small,
                                  ['stamp'], this.scope, this.scope.game);
        });

        when('map is flipped', function() {
          this.scope.ui_state = { flip_map : true };
        }, function() {
          it('should place-flipMove model', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', e.flipMove+'Place',
                                    this.scope.factions, e.small,
                                    ['stamp'], this.scope, this.scope.game);
          });
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
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    describe('when user set place max length', function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService.placeMaxLength._retVal = 42;

        this.modelsModeService.actions.setPlaceMaxLength(this.scope);
      });

      it('should fetch first model\'s place max length', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'models');
        expect(this.modelService.placeMaxLength)
          .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
      });
      
      it('should prompt user for max length', function() {
        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('prompt',
                                'Set place max length :',
                                42);
      });

      using([
        [ 'value', 'max' ],
        [ 42     , 42    ],
        [ 0      , null  ],
      ], function(e, d) {
        describe('when user validates prompt, '+d, function() {
          beforeEach(function() {
            this.promptService.prompt.resolve(e.value);
          });
          
          it('should set model\'s place max length', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setPlaceMaxLength', e.max,
                                    ['stamp1','stamp2'], this.scope, this.scope.game);
          });
        });
      });

      describe('when user cancel prompt', function() {
        beforeEach(function() {
          this.promptService.prompt.reject('canceled');
        });
        
        it('should reset model\'s place max length', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'setPlaceMaxLength', null,
                                  ['stamp1','stamp2'], this.scope, this.scope.game);
        });
      });
    });

    when('user toggles placeWithin on models', function() {
      this.modelsModeService.actions
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
            expect(this.modelService.placeWithin)
              .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setPlaceWithin', e.set,
                                    this.gameModelSelectionService.get._retVal,
                                    this.scope, this.scope.game);
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
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    when('startPlace()', function() {
      this.modelService.startPlace(this.model);
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
        it('should not start place on model', function() {
          expect(this.modelService.isPlacing(this.model))
            .toBeFalsy();
        });
      });
    });

    describe('endPlace()', function() {
      it('should start place on model', function() {
        this.model = {
          state: { x: 240, y:240, r: 180,
                   sta: {
                     s: { x: 240, y: 240 }
                   }
                 }
        };
        
        this.modelService.endPlace(this.model);

        expect(this.model.state.pla)
          .toBe(null);
        expect(this.modelService.isPlacing(this.model))
          .toBeFalsy();
      });
    });

    when('setPlaceTarget(<factions>, <target>)', function() {
      this.modelService.setPlaceTarget('factions', this.target, this.model);
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
        this.gameFactionsService.getModelInfo._retVal = {
          base_radius: 9.842,
        };
      });
      
      it('should orient place lane toward <target>', function() {
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 80, y: 79.99999999999999, r: 180 });
        expect(R.pick(['x','y','r'], this.model.state.pla.s))
          .toEqual({ x: 160, y: 160, r: -44.99999999999999 });
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should not orient place lane toward <target>', function() {
          expect(R.pick(['x','y','r'], this.model.state))
            .toEqual({ x: 240, y: 240, r: 180 });
          expect(R.pick(['x','y','r'], this.model.state.pla.s))
            .toEqual({ x: 160, y: 160 });
        });
      });
    });

    when('setPlaceOrigin(<factions>, <origin>)', function() {
      this.modelService.setPlaceOrigin('factions', this.origin, this.model);
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
        this.gameFactionsService.getModelInfo._retVal = {
          base_radius: 9.842,
        };
      });
      
      it('should orient place lane toward <target>', function() {
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 210.59644256269408, y: 58.807114874611855, r: 180 });
        expect(R.pick(['x','y','r'], this.model.state.pla.s))
          .toEqual({ x: 160, y: 160, r: 26.56505117707799 });
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should not orient place lane toward <target>', function() {
          expect(R.pick(['x','y','r'], this.model.state))
            .toEqual({ x: 240, y: 240, r: 180 });
          expect(R.pick(['x','y','r'], this.model.state.pla.s))
            .toEqual({ x: 160, y: 160 });
        });
      });
    });
    
    describe('setPlaceMaxLength(<length>)', function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp', pml: [] }
        };
        
        this.modelService.setPlaceMaxLength(42, this.model);
      });
      
      it('should set place max length on model', function() {
        expect(this.modelService.placeMaxLength(this.model))
          .toBe(42);
      });
    });

    using([
      [ 'move', 'start',
        'start_result', 'result',
        'start_small_result', 'small_result' ],
      [ 'rotateLeftPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 80.00000000000003 },
        { x: 239.39231012048833, y: 233.0540728933228, r: 180 },
        { x: 200, y: 240, r: 87.99999999999999 },
        { x: 239.97563308076383, y: 238.60402013189994, r: 180 } ],
      [ 'rotateRightPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 99.99999999999999 },
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
        { x: 200, y: 240, r: 75.96375653207353 }, { x: 240, y: 230, r: 180 },
        { x: 200, y: 240, r: 88.56790381583536 }, { x: 240, y: 239, r: 180 } ],
      [ 'shiftDownPlace',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 104.0362434679265 }, { x: 240, y: 250, r: 180 },
        { x: 200, y: 240, r: 91.43209618416466 }, { x: 240, y: 241, r: 180 } ],
    ], function(e, d) {
      describe(e.move+'(<small>)', function() {
        beforeEach(function() {
          this.model = {
            state: { info: 'info', x: 240, y: 240, r: 180,
                     pla: { s: e.start }
                   }
          };
          this.gameFactionsService.getModelInfo._retVal = {
            base_radius: 7.874
          };
          spyOn(this.modelService, 'checkState')
            .and.callThrough();
          this.modelService.checkState$ = R.curryN(3, this.modelService.checkState);
        });

        using([
          [ 'small', 'result', 'start_result' ],
          [ false  , e.result, e.start_result ],
          [ true   , e.small_result, e.start_small_result ],
        ], function(ee, dd) {
          when('target is not set', function() {
            this.modelService[e.move]('factions', ee.small, this.model);
          }, function() {
            it('should '+e.move+' model, '+dd, function() {
              expect(R.pick(['x','y','r'], this.model.state))
                .toEqual(ee.result);
              expect(this.model.state.pla.s)
                .toEqual(ee.start_result);
            });
          });
        });

        it('should check state', function() {
          this.modelService[e.move]('factions', false, this.model);
          expect(this.modelService.checkState)
            .toHaveBeenCalledWith('factions', null, jasmine.any(Object));
        });
        
        when('model is locked', function() {
          this.modelService.setLock(true, this.model);
        }, function() {
          it('should not '+e.move+' model', function() {
            expect(R.pick(['x','y','r'], this.model.state))
              .toEqual({ x: 240, y: 240, r: 180 });
          });
        });
      });
    });
  });
});
